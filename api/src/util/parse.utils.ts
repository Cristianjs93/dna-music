export function stringOrNull(element: any): string | null {
  return typeof element === 'string' ? element : null;
}

export function nonEmptyStringOrNull(element: unknown): string | null {
  const res = stringOrNull(element);
  return res?.trim() === '' ? null : res;
}

export function nonEmptyStringOrUndefined(
  element: unknown,
): string | undefined {
  const res = stringOrNull(element);
  return res === null || res.trim() === '' ? undefined : res;
}

export function nonEmptyStringOrElse<T>(
  element: unknown,
  elseValue: T,
): string | T {
  const res = stringOrNull(element);
  return !res || res.trim() === '' ? elseValue : res;
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return typeof value !== undefined && value !== null;
}
