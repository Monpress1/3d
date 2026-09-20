export const MARKET_ITEMS = {
  stick: { label: 'Stick', buyPrice: 12, sellPrice: 8 },
  stone: { label: 'Stone', buyPrice: 14, sellPrice: 10 },
  rope: { label: 'Rope', buyPrice: 20, sellPrice: 14 },
  meat: { label: 'Meat', buyPrice: 18, sellPrice: 12 },
  ammo: { label: 'Ammo', buyPrice: 28, sellPrice: 0 },
  medkit: { label: 'Medkit', buyPrice: 45, sellPrice: 0 }
};

export function createEconomySystem(initialState = {}) {
  const state = {
    coins: 120,
    bag: { stick: 0, stone: 0, rope: 0, meat: 0, ammo: 0, medkit: 0 },
    shopOpen: false,
    marketPosition: { x: 220, z: 170 },
    nearby: false,
    ...initialState
  };

  function addCoins(amount) {
    state.coins = Math.max(0, Number(state.coins) + Number(amount));
    return state.coins;
  }

  function spendCoins(amount) {
    const value = Number(amount) || 0;
    if (state.coins < value) return false;
    state.coins -= value;
    return true;
  }

  function getBagCount(item) {
    return Number(state.bag[item] || 0);
  }

  function setBagCount(item, count) {
    state.bag[item] = Math.max(0, Number(count) || 0);
    return state.bag[item];
  }

  function addBagItem(item, amount = 1) {
    const safe = Number(amount) || 0;
    if (!state.bag[item]) state.bag[item] = 0;
    state.bag[item] += safe;
    return state.bag[item];
  }

  function removeBagItem(item, amount = 1) {
    const safe = Number(amount) || 0;
    if (!state.bag[item]) return 0;
    const next = Math.max(0, state.bag[item] - safe);
    state.bag[item] = next;
    return next;
  }

  function canAfford(item, qty = 1) {
    const price = (MARKET_ITEMS[item]?.buyPrice || 0) * Number(qty || 1);
    return state.coins >= price;
  }

  function buyItem(item, qty = 1) {
    const info = MARKET_ITEMS[item];
    if (!info) return { success: false, reason: 'Unknown item' };
    const amount = Number(qty) || 1;
    const total = info.buyPrice * amount;
    if (state.coins < total) return { success: false, reason: 'Not enough coins' };
    state.coins -= total;
    addBagItem(item, amount);
    return { success: true, spent: total, remaining: state.coins };
  }

  function sellItem(item, qty = 1) {
    const info = MARKET_ITEMS[item];
    if (!info) return { success: false, reason: 'Unknown item' };
    const amount = Number(qty) || 1;
    const owned = getBagCount(item);
    if (owned < amount) return { success: false, reason: 'Not enough in bag' };
    removeBagItem(item, amount);
    const payout = info.sellPrice * amount;
    state.coins += payout;
    return { success: true, earned: payout, remaining: state.coins };
  }

  function distanceToMarket(playerX, playerZ) {
    const dx = playerX - state.marketPosition.x;
    const dz = playerZ - state.marketPosition.z;
    return Math.hypot(dx, dz);
  }

  function updateProximity(playerX, playerZ) {
    state.nearby = distanceToMarket(playerX, playerZ) < 120;
    return state.nearby;
  }

  function toggleShop(forceOpen = null) {
    if (forceOpen !== null) {
      state.shopOpen = !!forceOpen;
    } else {
      state.shopOpen = !state.shopOpen;
    }
    return state.shopOpen;
  }

  function getMarketSummary() {
    return {
      coins: state.coins,
      nearby: state.nearby,
      shopOpen: state.shopOpen,
      bag: { ...state.bag },
      catalog: MARKET_ITEMS
    };
  }

  return {
    state,
    addCoins,
    spendCoins,
    getBagCount,
    setBagCount,
    addBagItem,
    removeBagItem,
    canAfford,
    buyItem,
    sellItem,
    distanceToMarket,
    updateProximity,
    toggleShop,
    getMarketSummary
  };
}

export function bindMarketUi({ economy, onPurchase, onSell, root }) {
  const container = document.createElement('div');
  container.className = 'market-ui hidden';
  container.innerHTML = `
    <div class="market-panel">
      <div class="market-header">
        <h3>Marketplace</h3>
        <span class="coin-pill"><i class="fa-solid fa-coins"></i> <span id="marketCoinValue">0</span></span>
      </div>
      <div class="market-list"></div>
      <button class="market-close">Close</button>
    </div>
  `;

  const marketList = container.querySelector('.market-list');
  const coinValue = container.querySelector('#marketCoinValue');

  function renderCard(itemKey, info) {
    const row = document.createElement('div');
    row.className = 'market-item';
    row.innerHTML = `
      <div>
        <strong>${info.label}</strong>
        <small>Buy ${info.buyPrice} · Sell ${info.sellPrice}</small>
      </div>
      <div class="market-actions">
        <button data-action="sell" data-item="${itemKey}">Sell</button>
        <button data-action="buy" data-item="${itemKey}">Buy</button>
      </div>
    `;
    row.querySelector('[data-action="buy"]').addEventListener('click', () => {
      const result = onPurchase ? onPurchase(itemKey, 1) : economy.buyItem(itemKey, 1);
      if (result && result.success) render();
    });
    row.querySelector('[data-action="sell"]').addEventListener('click', () => {
      const result = onSell ? onSell(itemKey, 1) : economy.sellItem(itemKey, 1);
      if (result && result.success) render();
    });
    return row;
  }

  function render() {
    marketList.innerHTML = '';
    Object.entries(MARKET_ITEMS).forEach(([key, info]) => {
      marketList.appendChild(renderCard(key, info));
    });
    coinValue.textContent = String(economy.state.coins);
    container.classList.toggle('hidden', !economy.state.shopOpen);
  }

  container.querySelector('.market-close').addEventListener('click', () => {
    economy.toggleShop(false);
    render();
  });

  root.appendChild(container);
  render();
  return { render, element: container };
}

export function createNearMarketPrompt() {
  const el = document.createElement('div');
  el.id = 'marketPrompt';
  el.className = 'hidden';
  el.innerHTML = '<span class="keycap">E</span> Open Marketplace';
  return el;
}

export function registerMarketStyles() {
  const css = `
    .market-ui {
      position: fixed; inset: 0; z-index: 40; display: flex; align-items: center; justify-content: center;
      background: rgba(6, 15, 25, 0.7); backdrop-filter: blur(12px);
      transition: opacity 0.18s ease;
    }
    .market-ui.hidden { display: none; }
    .market-panel {
      width: min(480px, 90vw); border-radius: 18px; background: rgba(17, 31, 42, 0.95);
      border: 1px solid rgba(160, 220, 255, 0.35); box-shadow: 0 22px 44px rgba(0,0,0,0.42);
      color: #ebf8ff; padding: 18px 18px 14px;
    }
    .market-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
      font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;
    }
    .coin-pill {
      display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 214, 88, 0.15);
      border: 1px solid rgba(255, 214, 88, 0.35); border-radius: 999px; padding: 6px 10px; color: #ffe39b;
    }
    .market-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
    .market-item {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 12px;
    }
    .market-item strong { display: block; }
    .market-item small { color: #9ac7d8; }
    .market-actions { display: flex; gap: 8px; }
    .market-actions button, .market-close {
      appearance: none; border: none; border-radius: 10px; padding: 8px 12px; cursor: pointer;
      background: linear-gradient(135deg, #38b6ff, #0d7ec4); color: white; font-weight: 700;
    }
    .market-close { width: 100%; margin-top: 4px; }
    #marketPrompt {
      position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 15;
      display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 12px;
      background: rgba(10, 30, 45, 0.78); border: 1px solid rgba(255,255,255,0.2); color: #ebf8ff;
      box-shadow: 0 10px 28px rgba(0,0,0,0.28);
    }
    #marketPrompt.hidden { display: none; }
    .keycap {
      display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px;
      border-radius: 6px; background: rgba(255,255,255,0.18); font-weight: 800; font-size: 11px;
    }
  `;

  if (!document.getElementById('marketStyles')) {
    const style = document.createElement('style');
    style.id = 'marketStyles';
    style.textContent = css;
    document.head.appendChild(style);
  }
}

export default {
  MARKET_ITEMS,
  createEconomySystem,
  bindMarketUi,
  createNearMarketPrompt,
  registerMarketStyles
};

