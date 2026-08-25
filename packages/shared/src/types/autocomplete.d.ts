// Minimal type for @tarekraafat/autocomplete.js (no official types shipped).
declare module "@tarekraafat/autocomplete.js" {
  interface ResultItemData<T = unknown> {
    match: string;
    value: T;
    key?: string;
  }
  interface Feedback<T = unknown> {
    query: string;
    matches: { match: string; value: T; key?: string }[];
    results: { match: string; value: T; key?: string }[];
    cursor: number;
    selection: { index: number; match: string; value: T; key?: string };
    event: Event;
  }
  interface AutoCompleteOptions<T = unknown> {
    selector: string | (() => Element);
    data: {
      // Photon results carry `_feature` metadata beyond the displayed record,
      // so the return type is widened from `T[]` to `Record<string, unknown>[]`.
      // Callbacks (resultItem/events) narrow `value` via `as` casts at call sites.
      src: (query: string) => Promise<Record<string, unknown>[]> | Record<string, unknown>[];
      keys?: string[];
      cache?: boolean;
    };
    threshold?: number;
    debounce?: number;
    resultsList?: {
      tag?: string;
      maxResults?: number;
      element?: (list: HTMLUListElement, data: Feedback<T>) => void;
    };
    resultItem?: {
      tag?: string;
      highlight?: boolean | string;
      element?: (item: HTMLLIElement, data: ResultItemData<T>) => void;
    };
    events?: {
      input?: Record<string, (event: CustomEvent<Feedback<T>>) => void>;
      list?: Record<string, (event: Event) => void>;
    };
  }
  export default class autoComplete<T = unknown> {
    constructor(options: AutoCompleteOptions<T>);
    input: HTMLInputElement;
    init(): void;
    start(query?: string): void;
  }
}
