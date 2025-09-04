export function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  (Object.entries(obj) as [keyof T, T[keyof T]][]).forEach(([k, v]) => {
    if (v !== undefined) out[k] = v;
  });
  return out;
}

export function dropEmptyStrings<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  (Object.entries(obj) as [keyof T, T[keyof T]][]).forEach(([k, v]) => {
    if (typeof v === "string") {
      if (v.trim() !== "") out[k] = v as T[keyof T];
    } else if (v !== undefined) {
      out[k] = v;
    }
  });
  return out;
}
