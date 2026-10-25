// Sveltia CMS custom field type: "nhtsa_vehicle".
//
// Renders a category select plus make/model/year type-ahead inputs backed by
// the NHTSA vPic API (raw fetches via ../lib/nhtsa.js, cascade logic shared
// from ../lib/vehicle-cascade.js) and stores the resolved vehicle as
// `{ category, make, model, year }` — all strings, empty parts omitted.
//
// The type-ahead deliberately reuses the same component as the page's booking
// form vehicle fields (@tarekraafat/autocomplete.js, configured the same way
// in BookingForm.astro's initAC/openAll/openOnEmpty), so editing matches the
// site's form UX instead of native select dropdowns.
//
// Bundled by scripts/build-cms-field.mjs into each site's
// public/admin/vehicle-lookup.js and loaded after the Sveltia CDN script.
// The field degrades to plain text inputs when a lookup list is empty or the
// request fails, so editing never blocks. It self-aborts when the CMS global
// (or its bundled React) is unavailable.

import autoComplete from "@tarekraafat/autocomplete.js";
import { fetchMakeId } from "../lib/nhtsa.js";
import {
  getMakesRaw,
  loadMakeModels,
  makeNamesFrom,
  vehicleYears,
} from "../lib/vehicle-cascade.js";

const FIELD_TYPE = "nhtsa_vehicle";
const CATEGORIES = ["car", "motorcycle", "other"];
const LOOKUP_TIMEOUT_MS = 8000;
const VALUE_KEYS = ["category", "make", "model", "year"];
const SENTINEL = "::";
const MAX = 500;

/** Coerce any CMS value into the plain object this control edits. */
const asVehicle = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
        return parsed;
    } catch {
      /* not JSON — empty vehicle */
    }
  }
  return {};
};

const text = (value) => {
  const out =
    typeof value === "string" ? value : value == null ? "" : String(value);
  return out.trim();
};

/** Fetch helper with a hard timeout; anything that fails resolves []. */
const lookup = async (request) => {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve([]), LOOKUP_TIMEOUT_MS);
  });
  try {
    return await Promise.race([
      Promise.resolve(request()).catch(() => []),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
};

const compose = (vehicle) => {
  const out = {};
  for (const key of VALUE_KEYS) {
    const value = text(vehicle[key]);
    if (value) out[key] = value;
  }
  return out;
};

const selectOptions = (values, current, placeholder) => {
  const options = [];
  if (placeholder) {
    options.push({ value: "", label: placeholder });
  }
  if (current && !values.includes(current)) {
    options.push({ value: current, label: `${current} (saved)` });
  }
  for (const value of values) options.push({ value, label: value });
  return options;
};

/** Styles for the type-ahead panels. Injected once per admin page. */
const injectStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("nhtsa-ac-styles")) return;
  const style = document.createElement("style");
  style.id = "nhtsa-ac-styles";
  style.textContent = `
.autoComplete_wrapper { position: relative; display: block; }
.autoComplete_wrapper .nhtsa-ac-list {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 60;
  background: #fff; color: #111; border: 1px solid rgba(0,0,0,.25);
  max-height: 260px; overflow-y: auto; margin: 0; padding: 2px 0;
  list-style: none; box-shadow: 0 6px 16px rgba(0,0,0,.18);
}
.autoComplete_wrapper .nhtsa-ac-item { padding: 6px 10px; cursor: pointer; }
.autoComplete_wrapper .nhtsa-ac-item:hover { background: #f0f0f0; }
`;
  document.head.appendChild(style);
};

const registerField = (CMS) => {
  injectStyles();
  const { createElement: h, useState, useEffect, useRef } = CMS.React;
  // Sveltia exposes its bundled React 19 as CMS.React ("the full React API,
  // including hooks"), so useRef is normally available. Fall back to a stable
  // mutable object for older builds that omit it.
  const useLatestRef =
    typeof useRef === "function"
      ? useRef
      : (initial) => useState(() => ({ current: initial }))[0];

  // Years probed for a model name. Exact (case-insensitive) match first, then
  // the longest model name that is a prefix of the value — legacy content
  // stores marketing trims ("Aventador SVJ" → "Aventador", "F-150 Super
  // Snake" → "F-150", "Mustang Mach 1" → "Mustang") and the base model's
  // years are the closest truthful answer. Returns null when nothing matches.
  const yearsForModel = (byModel, name) => {
    const key = (name || "").trim().toLowerCase();
    if (!key) return null;
    let bestName = "";
    for (const modelName of Object.keys(byModel)) {
      const lower = modelName.toLowerCase();
      if (lower === key) return byModel[modelName];
      if (key.startsWith(lower) && modelName.length > bestName.length) {
        bestName = modelName;
      }
    }
    return bestName ? byModel[bestName] : null;
  };

  // The year list is model-scoped (per-model year probe from the shared
  // ../lib/vehicle-cascade.js loadMakeModels), the same behavior as the
  // booking form's year field. The canonical year RANGE travels inside
  // loadMakeModels' probing.

  // Type-ahead configuration mirrored from the booking form's vehicle fields
  // (BookingForm.astro initAC): same thresholds, same SENTINEL "open all",
  // same selection wiring — only the list/item CSS classes differ (the admin
  // page does not load the site stylesheet the form's classes live in).
  const makeAc = (input, getCandidates, onPick) => {
    const ac = new autoComplete({
      selector: () => input,
      threshold: 2,
      debounce: 250,
      data: {
        src: async (query) => {
          const candidates = await getCandidates();
          if (query === SENTINEL) {
            return candidates
              .slice(0, MAX)
              .map((c) => ({ value: c, _q: SENTINEL }));
          }
          const q = (query || "").trim().toLowerCase();
          return candidates
            .filter((c) => c.toLowerCase().includes(q))
            .slice(0, MAX)
            .map((c) => ({ value: c, _q: query || "" }));
        },
        cache: false,
        keys: ["_q"],
      },
      resultsList: {
        element: (list) => list.classList.add("nhtsa-ac-list"),
        maxResults: MAX,
        noResults: true,
      },
      resultItem: {
        highlight: false,
        element: (item, data) => {
          item.classList.add("nhtsa-ac-item");
          item.textContent = String(data.value.value);
        },
      },
      events: {
        input: {
          selection: (event) => {
            const detail = (event && event.detail) || {};
            const picked = detail.selection ? detail.selection.value : {};
            const val =
              typeof picked === "string" ? picked : String(picked.value ?? "");
            if (!val) return;
            input.value = val;
            onPick(val);
          },
        },
      },
    });
  };

  const openAll = (ac, input) => {
    input.focus();
    try {
      ac.start(SENTINEL);
    } catch {
      /* version drift — ignore */
    }
  };

  /**
   * Focus opens the list, like the form. A prefilled field (every existing
   * entry) also selects its text so the next keystroke replaces the value
   * instead of appending to it — otherwise typing into `2022` filters the
   * nonsense string `20222…` and the panel stays empty.
   */
  const openOnFocus = (ac, input, isFreeText) => {
    const onFocus = () => {
      if (isFreeText()) return;
      if (input.value) input.select();
      openAll(ac, input);
    };
    let reopen;
    const onInput = () => {
      if (isFreeText() || input.value || document.activeElement !== input)
        return;
      if (reopen) return;
      reopen = window.setTimeout(() => {
        reopen = undefined;
        if (!input.value && document.activeElement === input)
          openAll(ac, input);
      }, 300);
    };
    input.addEventListener("focus", onFocus);
    input.addEventListener("input", onInput);
    return () => {
      input.removeEventListener("focus", onFocus);
      input.removeEventListener("input", onInput);
      if (reopen) window.clearTimeout(reopen);
    };
  };

  const Control = (props) => {
    const { value, onChange } = props;
    const vehicle = asVehicle(value);
    const category = text(vehicle.category);
    const make = text(vehicle.make);
    const model = text(vehicle.model);
    const year = text(vehicle.year);

    const [makes, setMakes] = useState({ status: "loading", list: [] });
    const [models, setModels] = useState({ status: "idle", list: [] });
    // { byModel: model → probed years, all: years the make itself was offered }
    const [yearData, setYearData] = useState({ byModel: {}, all: [] });

    // Latest emitted composite. The CMS prop only seeds it at mount; composing
    // against the render-time prop would drop a change made before the CMS
    // re-renders (e.g. make followed quickly by year).
    const latest = useLatestRef(compose(vehicle));

    // Lists mirrored into refs so the type-ahead getters always read the
    // freshest data without re-mounting the autocomplete instances.
    const makesRef = useRef([]);
    const modelsRef = useRef([]);

    useEffect(() => {
      makesRef.current = makes.list;
    }, [makes]);
    useEffect(() => {
      modelsRef.current = models.list;
    }, [models]);
    useEffect(() => {
      yearsRef.current = yearData;
    }, [yearData]);

    // The type-ahead inputs (uncontrolled) — autoComplete.js wraps each input
    // and injects its list below it.
    const makeInputRef = useRef(null);
    const modelInputRef = useRef(null);
    const yearInputRef = useRef(null);
    const yearsRef = useRef({ byModel: {}, all: [] });

    // Merge a patch into the latest composite and emit. Empty parts are
    // omitted, so passing "" clears a key — including downstream keys.
    const emit = (patch) => {
      latest.current = compose({ ...latest.current, ...patch });
      onChange(latest.current);
    };

    // Makes follow the category (default "car" when unset). "other" has no
    // NHTSA list, so it lands on the empty state and stays free-text.
    useEffect(() => {
      let active = true;
      setMakes({ status: "loading", list: [] });
      lookup(() => getMakesRaw(category || "car")).then((list) => {
        if (!active) return;
        setMakes({ status: list.length ? "ready" : "empty", list });
      });
      return () => {
        active = false;
      };
    }, [category]);

    // Models follow the make (full all-model list), and the per-model year
    // map is probed once per make — both identical to the booking form's
    // loadModels (shared loadMakeModels). The year type-ahead then offers
    // ONLY the years of the picked model. A make that is not in the list
    // (free text) stays editable and its model input degrades to text.
    useEffect(() => {
      if (!make) {
        setModels({ status: "idle", list: [] });
        setYearData({ byModel: {}, all: [] });
        return undefined;
      }
      if (makes.status === "loading") return undefined;

      let active = true;
      setModels({ status: "loading", list: [] });
      setYearData({ byModel: {}, all: [] });
      (async () => {
        const makeId = await fetchMakeId(makes.list, make);
        if (!active) return;
        if (makeId == null) {
          setModels({ status: "empty", list: [] });
          return;
        }
        const data = await lookup(() => loadMakeModels(makeId));
        if (!active) return;
        setModels({
          status: data.names.length ? "ready" : "empty",
          list: data.names,
        });
        setYearData({ byModel: data.yearsByModel, all: data.years });
      })();
      return () => {
        active = false;
      };
    }, [make, makes.status, makes.list]);

    // Mount the same type-ahead component the booking forms use. Re-created
    // when the category changes (free-text mode needs no type-ahead). The
    // getter closures read the ref-mirrored lists, so while the fields are
    // loading or refetch nothing is re-bounded.
    useEffect(() => {
      const freeText = () => (category || "car") === "other";
      const mkInput = makeInputRef.current;
      const mdInput = modelInputRef.current;
      const yrInput = yearInputRef.current;
      if (!mkInput || !mdInput || !yrInput || freeText()) return undefined;

      const onMakePick = (val) => {
        emit({ make: val, model: "", year: "" });
        mdInput.value = "";
        yrInput.value = "";
      };
      const onModelPick = (val) => {
        emit({ model: val });
        yrInput.value = ""; // form parity: year follows the picked model
      };
      const onYearPick = (val) => {
        emit({ year: val });
      };

      const saved = (key, list, lower) => {
        const cur = text(latest.current[key]);
        if (cur && !list.some((n) => n.toLowerCase() === cur.toLowerCase()))
          list.push(cur);
        return list;
      };

      const acs = [
        {
          ac: makeAc(
            mkInput,
            () => saved("make", makeNamesFrom(makesRef.current)),
            onMakePick,
          ),
          input: mkInput,
        },
        {
          ac: makeAc(
            mdInput,
            () => saved("model", modelsRef.current.slice()),
            onModelPick,
          ),
          input: mdInput,
        },
        {
          ac: makeAc(
            yrInput,
            () => {
              // Form parity, with graceful degrades for legacy content: the
              // picked model's own years (exact, then base-model prefix for
              // marketing trims), else every year the make was offered, else
              // the canonical range while the probe is still in flight or the
              // make is unknown to vPic.
              const { byModel, all } = yearsRef.current;
              const matched = yearsForModel(
                byModel,
                text(latest.current.model),
              );
              const source =
                matched && matched.length
                  ? matched
                  : all && all.length
                    ? all
                    : vehicleYears();
              const list = [...new Set(source)]
                .sort((a, b) => a - b)
                .map(String);
              return saved("year", list);
            },
            onYearPick,
          ),
          input: yrInput,
        },
      ];
      const teardowns = acs.map(({ ac, input }) =>
        openOnFocus(ac, input, freeText),
      );
      // After picking a make, open the model list once models arrive — same
      // "next field opens" feel as the form.
      return () => {
        teardowns.forEach((fn) => fn());
        acs.forEach(({ ac }) => {
          try {
            if (ac && typeof ac.destroy === "function") ac.destroy();
          } catch {
            /* already gone */
          }
        });
      };
    }, [category]);

    const freeText = (category || "car") === "other";
    const makePlaceholder = freeText
      ? "Describe make (optional)"
      : makes.status === "loading"
        ? "Loading makes…"
        : "Start typing — make";
    const modelPlaceholder = freeText
      ? "Describe model (optional)"
      : make
        ? models.status === "loading"
          ? "Loading models…"
          : "Start typing — model"
        : "Pick a make first — or type manually";
    const yearPlaceholder = freeText
      ? "Year (optional)"
      : models.status === "loading"
        ? "Loading model years…"
        : "Start typing — year";

    const field = (label, control) =>
      h(
        "label",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            position: "relative",
          },
          key: label,
        },
        h("span", { style: { fontSize: "12px", opacity: 0.75 } }, label),
        control,
      );

    const acFieldInput = (ref, id, ph, val) =>
      h("input", {
        ref,
        id,
        type: "text",
        defaultValue: val,
        placeholder: ph,
        style: { width: "100%" },
        autoComplete: "off",
      });

    const categoryControl = h(
      "select",
      {
        id: `${props.forID}-category`,
        value: category,
        onChange: (event) => {
          const next = event.target.value;
          emit({ category: next, make: "", model: "", year: "" });
          const mk = makeInputRef.current;
          const md = modelInputRef.current;
          const yr = yearInputRef.current;
          if (mk) mk.value = "";
          if (md) md.value = "";
          if (yr) yr.value = "";
        },
        style: { width: "100%" },
      },
      selectOptions(CATEGORIES, category, "Select category").map((option) =>
        h(
          "option",
          { key: option.value || "placeholder", value: option.value },
          option.label,
        ),
      ),
    );

    const note =
      !freeText && (makes.status === "empty" || models.status === "empty")
        ? h(
            "p",
            { style: { margin: 0, fontSize: "12px", opacity: 0.65 } },
            "Lookup unavailable for this selection — enter the vehicle details as text.",
          )
        : null;

    return h(
      "div",
      {
        className: props.classNameWrapper,
        style: { display: "flex", flexDirection: "column", gap: "8px" },
      },
      h(
        "div",
        {
          style: {
            display: "grid",
            gap: "8px",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          },
        },
        [
          field("Category", categoryControl),
          field(
            "Make",
            acFieldInput(makeInputRef, "make", makePlaceholder, make),
          ),
          field(
            "Model",
            acFieldInput(modelInputRef, "model", modelPlaceholder, model),
          ),
          field(
            "Year",
            acFieldInput(yearInputRef, "year", yearPlaceholder, year),
          ),
        ],
      ),
      note,
    );
  };

  CMS.registerFieldType(FIELD_TYPE, Control);
};

const CMS = typeof window !== "undefined" ? window.CMS : undefined;

if (CMS && typeof CMS.registerFieldType === "function" && CMS.React) {
  registerField(CMS);
}
