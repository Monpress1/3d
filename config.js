window.gameConfig = {
  world: {
    size: 90,
    trees: [[-16, -10], [-22, 13], [18, -15], [23, 14], [-4, 22]],
    animals: [['sheep', -8, 10], ['cow', 10, 8], ['chicken', 4, -12]],
    people: [['Mia', -2, 8], ['Noah', 14, -3], ['Ari', -14, 4]]
  },
  camera: { mode: 'follow', sound: true },
  player: {
    speed: 7,
    coins: 700,
    hunger: 100,
    inventory: { hay: 2, feed: 3, trainingBlaster: 1, ammo: 12 }
  },
  market: [
    { id: 'house', name: 'Small house', category: 'Buildings', price: 300, type: 'building' },
    { id: 'car', name: 'Farm car', category: 'Vehicles', price: 500, type: 'vehicle' },
    { id: 'hay', name: 'Hay bundle', category: 'Supplies', price: 15, type: 'food' },
    { id: 'feed', name: 'Animal feed', category: 'Supplies', price: 25, type: 'food' },
    { id: 'trainingBlaster', name: 'Training blaster', category: 'Equipment', price: 100, type: 'tool' },
    { id: 'waterLauncher', name: 'Water launcher', category: 'Equipment', price: 180, type: 'tool' },
    { id: 'signalRocket', name: 'Signal rocket', category: 'Equipment', price: 250, type: 'tool' },
    { id: 'gameBomb', name: 'Game-safe noise bomb', category: 'Equipment', price: 220, type: 'tool' }
  ],
  weapons: {
    trainingBlaster: { name: 'Training blaster', damage: 20, range: 9, ammo: true },
    waterLauncher: { name: 'Water launcher', damage: 8, range: 8, ammo: true },
    signalRocket: { name: 'Signal rocket', damage: 35, range: 12, ammo: true },
    gameBomb: { name: 'Game-safe noise bomb', damage: 50, range: 5, ammo: true }
  },
  peopleTraits: ['curiosity', 'happiness', 'hunger', 'temporaryMadness']
};
