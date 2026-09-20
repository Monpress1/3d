export const keys = Object.create(null);
export const dpadState = { up: false, down: false, left: false, right: false };
export const input = { run: false, diving: false, jumping: false };

export function getInputState() {
  return { keys, dpadState, input };
}
