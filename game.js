import { createEconomySystem, bindMarketUi, createNearMarketPrompt, registerMarketStyles } from './marketplace.js';

registerMarketStyles();

const economy = createEconomySystem({
  coins: 150,
  bag: { stick: 2, stone: 1, rope: 0, meat: 0, ammo: 0, medkit: 0 },
  marketPosition: { x: 220, z: 170 }
});

const marketRoot = document.body;
const marketPrompt = createNearMarketPrompt();
marketRoot.appendChild(marketPrompt);

const ui = bindMarketUi({
  economy,
  onPurchase: (item, qty) => economy.buyItem(item, qty),
  onSell: (item, qty) => economy.sellItem(item, qty),
  root: marketRoot
});

window.PolyIslandMarket = {
  economy,
  ui,
  prompt: marketPrompt,
  updateNearby: (playerX, playerZ) => {
    const near = economy.updateProximity(playerX, playerZ);
    marketPrompt.classList.toggle('hidden', !near);
    if (near && !economy.state.shopOpen) {
      marketPrompt.textContent = 'E Open Marketplace';
    }
    return near;
  },
  openShop: () => {
    economy.toggleShop(true);
    ui.render();
  },
  closeShop: () => {
    economy.toggleShop(false);
    ui.render();
  }
};

console.log('Marketplace economy ready.');
