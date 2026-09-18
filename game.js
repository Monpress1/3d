class FarmGame {
  constructor() {
    this.c = gameConfig;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#b9dcf2');
    this.camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.move = { x: 0, z: 0 };
    this.player = null;
    this.people = [];
    this.animals = [];
    this.near = null;
    this.init();
  }

  init() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x668855, 1.4));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 25, 10);
    this.scene.add(sun);
    this.ground();
    this.playerBody();
    this.objects();
    this.touch();
    addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    });
    this.loop();
  }

  mat(color) { return new THREE.MeshStandardMaterial({ color }); }

  ground() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(this.c.world.size, this.c.world.size), this.mat('#79b85d'));
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
    const road = new THREE.Mesh(new THREE.BoxGeometry(18, 0.04, 4), this.mat('#d8bd83'));
    road.position.y = 0.02;
    this.scene.add(road);
  }

  playerBody() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.65, 1.2, 4, 8), this.mat('#765645'));
    body.position.y = 1.6;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.43, 16, 16), this.mat('#f0c5a2'));
    head.position.y = 2.75;
    group.add(head);
    const legs = [];
    for (const x of [-0.22, 0.22]) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.85, 4, 8), this.mat('#273044'));
      leg.position.set(x, 0.48, 0);
      group.add(leg);
      legs.push(leg);
    }
    this.player = { mesh: group, legs, walk: 0 };
    this.scene.add(group);
  }

  objects() {
    for (const [x, z] of this.c.world.trees) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.2, 8), this.mat('#74482e'));
      trunk.position.set(x, 1.1, z);
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.2, 14, 14), this.mat('#318344'));
      leaves.position.set(x, 2.8, z);
      this.scene.add(trunk, leaves);
    }
    for (const [type, x, z] of this.c.world.animals) this.animal(type, x, z);
    for (const [name, x, z] of this.c.world.people) this.person(name, x, z);
  }

  animal(type, x, z) {
    const group = new THREE.Group();
    const color = type === 'cow' ? '#73482f' : type === 'sheep' ? '#eee9df' : '#e2c43f';
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.7), this.mat(color));
    body.position.y = 0.65;
    group.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), this.mat('#eed0ad'));
    head.position.set(0.85, 0.85, 0);
    group.add(head);
    group.position.set(x, 0, z);
    group.userData = { kind: 'animal', name: type, traits: { hunger: 70, happiness: 70 } };
    this.scene.add(group);
    this.animals.push(group);
  }

  person(name, x, z) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1, 4, 8), this.mat('#536bb3'));
    body.position.y = 1.25;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 14), this.mat('#e6b995'));
    head.position.y = 2.2;
    group.add(body, head);
    group.position.set(x, 0, z);
    group.userData = {
      kind: 'person', name, health: 100, maxHealth: 100,
      traits: { curiosity: Math.round(Math.random() * 100), happiness: Math.round(Math.random() * 100), hunger: Math.round(Math.random() * 100), temporaryMadness: Math.random() < 0.15 }
    };
    this.scene.add(group);
    this.people.push(group);
  }

  touch() {
    const bind = (id, x, z) => {
      const button = document.getElementById(id);
      const set = value => { this.move[x === 0 ? 'z' : 'x'] = value; };
      button.addEventListener('touchstart', e => { e.preventDefault(); if (x) this.move.x = x; if (z) this.move.z = z; }, { passive: false });
      button.addEventListener('touchend', e => { e.preventDefault(); if (x) this.move.x = 0; if (z) this.move.z = 0; }, { passive: false });
    };
    bind('up', 0, -1); bind('down', 0, 1); bind('left', -1, 0); bind('right', 1, 0);
  }

  update(dt) {
    const movement = new THREE.Vector3(this.move.x, 0, this.move.z);
    if (movement.lengthSq()) {
      movement.normalize();
      this.player.mesh.position.addScaledVector(movement, this.c.player.speed * dt);
      this.player.mesh.rotation.y = Math.atan2(movement.x, movement.z);
      this.player.walk += dt * 9;
    } else this.player.walk += dt * 2;
    this.player.legs[0].rotation.x = Math.sin(this.player.walk) * 0.55;
    this.player.legs[1].rotation.x = -Math.sin(this.player.walk) * 0.55;
    const limit = this.c.world.size / 2 - 2;
    this.player.mesh.position.x = THREE.MathUtils.clamp(this.player.mesh.position.x, -limit, limit);
    this.player.mesh.position.z = THREE.MathUtils.clamp(this.player.mesh.position.z, -limit, limit);
    this.people.forEach((person, i) => { person.rotation.y += Math.sin(performance.now() / 1000 + i) * dt * 0.2; });
    this.findNear();
    this.follow();
  }

  findNear() {
    const all = [...this.people, ...this.animals];
    let best = null; let distance = 3.2;
    for (const object of all) {
      const current = object.position.distanceTo(this.player.mesh.position);
      if (current < distance) { best = object; distance = current; }
    }
    this.near = best;
    const prompt = document.getElementById('interactPrompt');
    prompt.classList.toggle('hidden', !best);
    if (best) document.getElementById('promptText').textContent = `Talk to ${best.userData.name}`;
  }

  follow() {
    const p = this.player.mesh.position;
    const mode = this.c.camera.mode;
    const destination = new THREE.Vector3(p.x, mode === 'topdown' ? 18 : mode === 'cinematic' ? 6 : 4, p.z + (mode === 'topdown' ? 0 : mode === 'cinematic' ? 10 : 9));
    this.camera.position.lerp(destination, 0.1);
    this.camera.lookAt(p.x, 1.3, p.z);
  }

  setMode(mode) { this.c.camera.mode = mode; }

  interact() {
    if (!this.near) return;
    const data = this.near.userData;
    if (data.kind === 'person') {
      setStatus(`${data.name}: HP ${data.health}/${data.maxHealth}, curiosity ${data.traits.curiosity}, happiness ${data.traits.happiness}, hunger ${data.traits.hunger}${data.traits.temporaryMadness ? ', feeling unpredictable' : ''}`);
    } else setStatus(`Your ${data.name} is ${Math.round(data.traits.hunger)}% hungry and ${data.traits.happiness}% happy`);
  }

  useEquippedWeapon(weaponId) {
    const weapon = this.c.weapons[weaponId];
    if (!weapon) { setStatus('Select a game item first'); return; }
    if (!state.inventory[weaponId]) { setStatus('You do not own that item'); return; }
    if (weapon.ammo && (state.inventory.ammo || 0) < 1) { setStatus('You need more game ammo'); return; }
    if (weapon.ammo) state.inventory.ammo--;
    const target = this.people.reduce((closest, person) => {
      const distance = person.position.distanceTo(this.player.mesh.position);
      return distance <= weapon.range && (!closest || distance < closest.distance) ? { person, distance } : closest;
    }, null);
    if (target) {
      target.person.userData.health = Math.max(0, target.person.userData.health - weapon.damage);
      target.person.position.x += 0.25;
      setStatus(`${weapon.name} affected ${target.person.userData.name}: HP ${target.person.userData.health}/${target.person.userData.maxHealth}`);
      if (target.person.userData.health === 0) setStatus(`${target.person.userData.name} is down. Medical help is needed.`);
    } else setStatus(`${weapon.name} used safely; no nearby NPC was targeted`);
    playActionSound(this.c.camera.sound);
    refresh();
  }

  loop() { requestAnimationFrame(() => this.loop()); this.update(this.clock.getDelta()); this.renderer.render(this.scene, this.camera); }
}
function playActionSound(enabled) { if (!enabled) return; const audio = new AudioContext(); const oscillator = audio.createOscillator(); const gain = audio.createGain(); oscillator.frequency.value = 170; oscillator.type = 'square'; gain.gain.setValueAtTime(0.08, audio.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.15); oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + 0.15); }
