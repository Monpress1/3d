import { createEconomySystem, bindMarketUi, createNearMarketPrompt, registerMarketStyles } from './marketplace.js';
import { bindVirtualJoystick } from './controls.js';

registerMarketStyles();
bindVirtualJoystick(document);

const economy = createEconomySystem({
  coins: Number(localStorage.getItem('polyIslandCoins') || 150),
  marketPosition: { x: 220, z: 170 }
});

const marketPrompt = createNearMarketPrompt();
document.body.appendChild(marketPrompt);
const ui = bindMarketUi({ economy, root: document.body });

function saveEconomy() {
  localStorage.setItem('polyIslandCoins', String(economy.state.coins));
  localStorage.setItem('polyIslandBag', JSON.stringify(economy.state.bag));
}

window.addEventListener('beforeunload', saveEconomy);
window.PolyIslandMarket = {
  economy,
  ui,
  prompt: marketPrompt,
  updateNearby: (playerX, playerZ) => {
    const near = economy.updateProximity(playerX, playerZ);
    marketPrompt.classList.toggle('hidden', !near || economy.state.shopOpen);
    return near;
  },
  openShop: () => { economy.toggleShop(true); ui.render(); },
  closeShop: () => { economy.toggleShop(false); ui.render(); },
  save: saveEconomy
};

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyE' && economy.state.nearby) {
    economy.toggleShop();
    ui.render();
  }
});
