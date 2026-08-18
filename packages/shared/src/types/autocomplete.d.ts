// Minimal type for @tarekraafat/autocomplete.js (no official types shipped).
declare module "@tarekraafat/autocomplete.js" {
  interface ResultItemData<T = any> {
    match: string;
    value: T;
    key?: string;
  }
  interface Feedback<T = any> {
    query: string;
    matches: { match: string; value: T; key?: string }[];
    results: { match: string; value: T; key?: string }[];
    cursor: number;
    selection: { index: number; match: string; value: T; key?: string };
    event: Event;
  }
  interface AutoCompleteOptions<T = any> {
    selector: string | (() => Element);
    data: {
      src: (query: string) => Promise<T[]> | T[];
      keys?: string[];
      cache?: boolean;
    };
    threshold?: number;
    debounce?: number;
    resultsList?: {
      tag?: string;
      maxResults?: number;
      element?: (list: HTMLUListElement, data: any) => void;
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
  export default class autoComplete<T = any> {
    constructor(options: AutoCompleteOptions<T>);
    input: HTMLInputElement;
    init(): void;
    start(query?: string): void;
  }
}
