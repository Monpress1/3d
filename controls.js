export const keys = Object.create(null);
export const dpadState = { up: false, down: false, left: false, right: false };
export const input = { run: false, diving: false, jumping: false };

const joystickState = { active: false, pointerId: null, x: 0, y: 0, radius: 48 };

export function getInputState() {
  return { keys, dpadState, input, joystickState };
}

export function bindVirtualJoystick(root = document) {
  const base = root.querySelector('#moveJoystick');
  const stick = root.querySelector('#moveJoystickStick');
  if (!base || !stick || base.dataset.bound === 'true') return joystickState;
  base.dataset.bound = 'true';

  function update(clientX, clientY) {
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const distance = Math.hypot(dx, dy);
    const scale = distance > joystickState.radius ? joystickState.radius / distance : 1;
    const x = dx * scale;
    const y = dy * scale;
    joystickState.x = x / joystickState.radius;
    joystickState.y = y / joystickState.radius;
    dpadState.left = joystickState.x < -0.18;
    dpadState.right = joystickState.x > 0.18;
    dpadState.up = joystickState.y < -0.18;
    dpadState.down = joystickState.y > 0.18;
    stick.style.transform = `translate(${x}px, ${y}px)`;
  }

  function release(event) {
    if (event && joystickState.pointerId !== event.pointerId) return;
    joystickState.active = false;
    joystickState.pointerId = null;
    joystickState.x = 0;
    joystickState.y = 0;
    dpadState.up = dpadState.down = dpadState.left = dpadState.right = false;
    stick.style.transform = 'translate(0, 0)';
    base.classList.remove('active');
  }

  base.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    joystickState.active = true;
    joystickState.pointerId = event.pointerId;
    base.classList.add('active');
    try { base.setPointerCapture(event.pointerId); } catch (_) {}
    update(event.clientX, event.clientY);
  }, { passive: false });
  base.addEventListener('pointermove', (event) => {
    if (!joystickState.active || event.pointerId !== joystickState.pointerId) return;
    event.preventDefault();
    update(event.clientX, event.clientY);
  }, { passive: false });
  base.addEventListener('pointerup', release);
  base.addEventListener('pointercancel', release);
  base.addEventListener('lostpointercapture', release);
  return joystickState;
}
