export const ALLOWED_PIN_LENGTHS = [4, 6] as const;

export function isAllowedPinLength(length: number): length is 4 | 6 {
  return ALLOWED_PIN_LENGTHS.includes(length as 4 | 6);
}

export function isNumericPin(pin: string) {
  return /^\d+$/.test(pin);
}

export function isValidPin(pin: string) {
  return isNumericPin(pin) && isAllowedPinLength(pin.length);
}

export function assertValidPin(pin: string) {
  if (!isValidPin(pin)) {
    throw new Error('INVALID_PIN');
  }
}
