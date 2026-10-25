// Sveltia CMS custom field type: "nhtsa_vehicle".
//
// Renders a category → make → model → year cascade backed by the NHTSA vPic
// API (via ../lib/nhtsa.js) and stores the resolved vehicle as
// `{ category, make, model, year }` — all strings, empty parts omitted.
//
// Bundled by scripts/build-cms-field.mjs into each site's
// public/admin/vehicle-lookup.js and loaded after the Sveltia CDN script.
// The field degrades to plain text inputs when a lookup list is empty or the
// request fails, so editing never blocks. It self-aborts when the CMS global
// (or its bundled React) is unavailable.

import { fetchMakeId, fetchModels } from "../lib/nhtsa.js";
import {
  getMakesRaw,
  makeNamesFrom,
  modelNamesFrom,
  vehicleYears,
} from "../lib/vehicle-cascade.js";

const FIELD_TYPE = "nhtsa_vehicle";
const CATEGORIES = ["car", "motorcycle", "other"];
const LOOKUP_TIMEOUT_MS = 8000;
const VALUE_KEYS = ["category", "make", "model", "year"];

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

const registerField = (CMS) => {
  const { createElement: h, useState, useEffect, useRef } = CMS.React;
  // Sveltia exposes its bundled React 19 as CMS.React ("the full React API,
  // including hooks"), so useRef is normally available. Fall back to a stable
  // mutable object for older builds that omit it.
  const useLatestRef =
    typeof useRef === "function"
      ? useRef
      : (initial) => useState(() => ({ current: initial }))[0];

  // Years reuse the booking form's canonical range (shared ../lib/
  // vehicle-cascade.js), reversed into the CMS select's newest-first order.
  const YEARS = vehicleYears()
    .map((y) => String(y))
    .reverse();

  const Control = (props) => {
    const { value, onChange, forID } = props;
    const vehicle = asVehicle(value);
    const category = text(vehicle.category);
    const make = text(vehicle.make);
    const model = text(vehicle.model);
    const year = text(vehicle.year);

    const [makes, setMakes] = useState({ status: "loading", list: [] });
    const [models, setModels] = useState({ status: "idle", list: [] });

    // Latest emitted composite. The CMS prop only seeds it at mount; composing
    // against the render-time prop would drop a change made before the CMS
    // re-renders (e.g. make followed quickly by year).
    const latest = useLatestRef(compose(vehicle));

    // Merge a patch into the latest composite and emit. Empty parts are
    // omitted, so passing "" clears a key — including downstream keys.
    const emit = (patch) => {
      latest.current = compose({ ...latest.current, ...patch });
      onChange(latest.current);
    };

    // Makes follow the category (default "car" when unset). "other" has no
    // NHTSA list, so it lands on the empty state and renders a text input.
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

    // Models follow make + year. Wait for the make list before resolving the
    // id; a make that is not in the list (free text) stays editable and its
    // model input degrades to text.
    useEffect(() => {
      if (!make) {
        setModels({ status: "idle", list: [] });
        return undefined;
      }
      if (makes.status === "loading") return undefined;

      let active = true;
      setModels({ status: "loading", list: [] });
      (async () => {
        const makeId = await fetchMakeId(makes.list, make);
        if (!active) return;
        if (makeId == null) {
          setModels({ status: "empty", list: [] });
          return;
        }
        const list = await lookup(() =>
          fetchModels(makeId, year ? Number(year) : undefined),
        );
        if (!active) return;
        setModels({ status: list.length ? "ready" : "empty", list });
      })();
      return () => {
        active = false;
      };
    }, [make, year, makes.status, makes.list]);

    const field = (label, control) =>
      h(
        "label",
        {
          style: { display: "flex", flexDirection: "column", gap: "4px" },
          key: label,
        },
        h("span", { style: { fontSize: "12px", opacity: 0.75 } }, label),
        control,
      );

    const select = (options, selected, onChangeHandler, id) =>
      h(
        "select",
        {
          id,
          value: selected,
          onChange: (event) => onChangeHandler(event.target.value),
          className: props.classNameWrapper,
          style: { width: "100%" },
        },
        options.map((option) =>
          h(
            "option",
            { key: option.value || "placeholder", value: option.value },
            option.label,
          ),
        ),
      );

    const input = (selected, onChangeHandler, id, placeholder) =>
      h("input", {
        id,
        type: "text",
        value: selected,
        placeholder,
        className: props.classNameWrapper,
        onChange: (event) => onChangeHandler(event.target.value),
        style: { width: "100%" },
      });

    const categoryControl = select(
      selectOptions(CATEGORIES, category, "Select category"),
      category,
      (next) => emit({ category: next, make: "", model: "", year: "" }),
      forID,
    );

    const makeValues = makeNamesFrom(makes.list);
    const makeControl =
      makes.status === "empty"
        ? input(
            make,
            (next) => emit({ make: next, model: "", year: "" }),
            `${forID}-make`,
            "Make",
          )
        : select(
            selectOptions(
              makeValues,
              make,
              makes.status === "loading" ? "Loading makes…" : "Select make",
            ),
            make,
            (next) => emit({ make: next, model: "", year: "" }),
            `${forID}-make`,
          );

    const modelValues = modelNamesFrom(models.list);
    const modelControl =
      models.status === "empty"
        ? input(
            model,
            (next) => emit({ model: next }),
            `${forID}-model`,
            "Model",
          )
        : select(
            selectOptions(
              modelValues,
              model,
              models.status === "loading" ? "Loading models…" : "Select model",
            ),
            model,
            (next) => emit({ model: next }),
            `${forID}-model`,
          );

    const yearControl = select(
      selectOptions(YEARS, year, "Select year"),
      year,
      (next) => emit({ year: next }),
      `${forID}-year`,
    );

    const note =
      makes.status === "empty" || models.status === "empty"
        ? h(
            "p",
            { style: { margin: 0, fontSize: "12px", opacity: 0.65 } },
            "Lookup unavailable for this selection — enter the vehicle details as text.",
          )
        : null;

    return h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "8px" } },
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
          field("Make", makeControl),
          field("Model", modelControl),
          field("Year", yearControl),
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
