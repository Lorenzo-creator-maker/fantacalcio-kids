// FantaCalcio Kids — Mercato di Riparazione & Scambi tra Squadre
// Regole: Scambi alla pari tra manager, svincolo con recupero crediti e acquisto calciatori liberi

import { createCardHTML, ROLE_EMOJI, ROLE_SHORT } from '../data/players.js';

export function renderMarket(container, gameState, callbacks) {
  let activeTab = 'trades'; // 'trades' | 'freeAgents'
  let tradeManagerA = 0;
  let tradeManagerB = gameState.managers.length > 1 ? 1 : 0;
  let selectedPlayerA = null;
  let selectedPlayerB = null;

  let freeAgentManagerIdx = 0;
  let selectedReleasePlayer = null;
  let selectedBuyPlayer = null;
  let freeAgentRoleFilter = 'ALL';

  function getPlayer(id) {
    return gameState.allPlayers.find(p => p.id === id);
  }

  // Giocatori già posseduti da qualche manager
  function getOwnedPlayerIds() {
    const ids = new Set();
    gameState.managers.forEach(m => {
      (m.squad || []).forEach(pid => ids.add(pid));
    });
    return ids;
  }

  function getFreeAgents() {
    const owned = getOwnedPlayerIds();
    return gameState.allPlayers
      .filter(p => !owned.has(p.id))
      .filter(p => freeAgentRoleFilter === 'ALL' || p.role === freeAgentRoleFilter)
      .sort((a, b) => b.rating - a.rating);
  }

  function renderMarketUI() {
    const lastAction = (gameState.marketHistory && gameState.marketHistory.length > 0)
      ? gameState.marketHistory[gameState.marketHistory.length - 1]
      : null;

    container.innerHTML = `
      <div class="screen screen-market">
        <button class="btn-back" id="btn-back-standings">← Torna alla Classifica</button>

        <h1 class="screen-title">🔄 Mercato & Scambi</h1>
        <div class="market-subtitle">Migliora la tua squadra prima della prossima giornata!</div>

        ${lastAction ? `
          <div class="market-undo-bar">
            <span>Ultima op.: <strong>${lastAction.message}</strong></span>
            <button class="btn-undo" id="btn-undo-market">
              ↩️ Annulla Operazione
            </button>
          </div>
        ` : ''}

        <div class="market-tabs">
          <button class="market-tab ${activeTab === 'trades' ? 'active' : ''}" id="tab-trades">
            🤝 Scambi tra Squadre
          </button>
          <button class="market-tab ${activeTab === 'freeAgents' ? 'active' : ''}" id="tab-free-agents">
            🆓 Calciatori Svincolati (${getFreeAgents().length})
          </button>
        </div>

        ${activeTab === 'trades' ? renderTradesUI() : renderFreeAgentsUI()}
      </div>
    `;

    bindEvents();
  }

  function renderTradesUI() {
    const mgrA = gameState.managers[tradeManagerA];
    const mgrB = gameState.managers[tradeManagerB];

    const squadA = (mgrA.squad || []).map(getPlayer).filter(Boolean);
    const squadB = (mgrB.squad || []).map(getPlayer).filter(Boolean);

    const playerObjA = selectedPlayerA ? getPlayer(selectedPlayerA) : null;
    const playerObjB = selectedPlayerB ? getPlayer(selectedPlayerB) : null;

    const canTrade = selectedPlayerA !== null && selectedPlayerB !== null && tradeManagerA !== tradeManagerB;

    return `
      <div class="market-trades-section animate-fade-in">
        <div class="trade-selectors">
          <!-- Squadra A -->
          <div class="trade-box" style="--mgr-color: ${mgrA.color}">
            <div class="trade-box-header">
              <label>Squadra 1:</label>
              <select id="select-manager-a" class="trade-mgr-select">
                ${gameState.managers.map((m, i) => `
                  <option value="${i}" ${i === tradeManagerA ? 'selected' : ''}>${m.name} (${m.budget}M)</option>
                `).join('')}
              </select>
            </div>

            <div class="trade-slot-card">
              ${playerObjA ? `
                ${createCardHTML(playerObjA, { small: true })}
                <div class="trade-selected-name">${playerObjA.name}</div>
              ` : `
                <div class="trade-slot-placeholder">Seleziona una carta sotto</div>
              `}
            </div>

            <div class="trade-squad-list">
              <h4>Rosa di ${mgrA.name}:</h4>
              <div class="trade-mini-cards">
                ${squadA.map(p => `
                  <button class="trade-mini-btn ${p.id === selectedPlayerA ? 'selected' : ''}" data-pick-a="${p.id}">
                    ${ROLE_EMOJI[p.role]} ${p.name} (${p.rating}⭐)
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="trade-arrows">⇄</div>

          <!-- Squadra B -->
          <div class="trade-box" style="--mgr-color: ${mgrB.color}">
            <div class="trade-box-header">
              <label>Squadra 2:</label>
              <select id="select-manager-b" class="trade-mgr-select">
                ${gameState.managers.map((m, i) => `
                  <option value="${i}" ${i === tradeManagerB ? 'selected' : ''}>${m.name} (${m.budget}M)</option>
                `).join('')}
              </select>
            </div>

            <div class="trade-slot-card">
              ${playerObjB ? `
                ${createCardHTML(playerObjB, { small: true })}
                <div class="trade-selected-name">${playerObjB.name}</div>
              ` : `
                <div class="trade-slot-placeholder">Seleziona una carta sotto</div>
              `}
            </div>

            <div class="trade-squad-list">
              <h4>Rosa di ${mgrB.name}:</h4>
              <div class="trade-mini-cards">
                ${squadB.map(p => `
                  <button class="trade-mini-btn ${p.id === selectedPlayerB ? 'selected' : ''}" data-pick-b="${p.id}">
                    ${ROLE_EMOJI[p.role]} ${p.name} (${p.rating}⭐)
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="trade-actions-footer">
          <button class="btn btn-primary btn-glow btn-large ${canTrade ? '' : 'btn-disabled'}" 
                  id="btn-confirm-trade" ${canTrade ? '' : 'disabled'}>
            🤝 Conferma Scambio Giocatori!
          </button>
        </div>
      </div>
    `;
  }

  function renderFreeAgentsUI() {
    const mgr = gameState.managers[freeAgentManagerIdx];
    const squad = (mgr.squad || []).map(getPlayer).filter(Boolean);
    const freeAgents = getFreeAgents();

    const relPlayer = selectedReleasePlayer ? getPlayer(selectedReleasePlayer) : null;
    const buyPlayer = selectedBuyPlayer ? getPlayer(selectedBuyPlayer) : null;

    const releaseCredits = relPlayer ? Math.max(1, Math.floor(relPlayer.basePrice / 2)) : 0;
    const canBuy = buyPlayer && (mgr.budget + releaseCredits) >= buyPlayer.basePrice;

    return `
      <div class="market-free-agents-section animate-fade-in">
        <div class="fa-manager-selector" style="--mgr-color: ${mgr.color}">
          <label>Gestisci Squadra:</label>
          <select id="select-fa-manager" class="trade-mgr-select">
            ${gameState.managers.map((m, i) => `
              <option value="${i}" ${i === freeAgentManagerIdx ? 'selected' : ''}>${m.name} (Budget: ${m.budget}M)</option>
            `).join('')}
          </select>
        </div>

        <div class="fa-exchange-boxes">
          <!-- Svincola -->
          <div class="fa-sub-box">
            <h3>1. Svincola un Giocatore</h3>
            <p class="fa-hint">Recuperi il 50% del valore (${releaseCredits}M crediti)</p>
            <div class="fa-selected-preview">
              ${relPlayer ? `
                <div class="fa-chip selected">
                  ${ROLE_EMOJI[relPlayer.role]} ${relPlayer.name} (+${releaseCredits}M)
                  <button id="btn-cancel-release">✕</button>
                </div>
              ` : '<div class="fa-chip-empty">Nessun giocatore selezionato per svincolo</div>'}
            </div>

            <div class="fa-squad-chips">
              ${squad.map(p => `
                <button class="trade-mini-btn ${p.id === selectedReleasePlayer ? 'selected' : ''}" data-rel-id="${p.id}">
                  ${ROLE_EMOJI[p.role]} ${p.name}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Acquista Svincolato -->
          <div class="fa-sub-box">
            <h3>2. Acquista Svincolato</h3>
            <div class="fa-role-filters">
              ${['ALL', 'P', 'D', 'C', 'A'].map(r => `
                <button class="fa-rf-btn ${freeAgentRoleFilter === r ? 'active' : ''}" data-fa-role="${r}">
                  ${r === 'ALL' ? 'Tutti' : `${ROLE_EMOJI[r]} ${ROLE_SHORT[r]}`}
                </button>
              `).join('')}
            </div>

            <div class="fa-selected-preview">
              ${buyPlayer ? `
                <div class="fa-chip selected">
                  ${ROLE_EMOJI[buyPlayer.role]} ${buyPlayer.name} (Costo: ${buyPlayer.basePrice}M)
                  <button id="btn-cancel-buy">✕</button>
                </div>
              ` : '<div class="fa-chip-empty">Seleziona un calciatore svincolato dalla lista</div>'}
            </div>

            <div class="fa-free-list">
              ${freeAgents.map(p => {
                const canAfford = (mgr.budget + releaseCredits) >= p.basePrice;
                return `
                  <div class="fa-card-row ${p.id === selectedBuyPlayer ? 'selected' : ''}">
                    <span class="fa-row-name">${ROLE_EMOJI[p.role]} <strong>${p.name}</strong> (${p.team})</span>
                    <span class="fa-row-stars">${p.rating}⭐</span>
                    <span class="fa-row-price">${p.basePrice}M</span>
                    <button class="btn btn-small ${canAfford ? 'btn-primary' : 'btn-disabled'}" 
                            data-buy-id="${p.id}" ${canAfford ? '' : 'disabled'}>
                      ${p.id === selectedBuyPlayer ? '✓ Scelto' : 'Scegli'}
                    </button>
                  </div>
                `;
              }).join('')}
              ${freeAgents.length === 0 ? '<div class="no-free-agents">Nessun calciatore svincolato disponibile</div>' : ''}
            </div>
          </div>
        </div>

        <div class="fa-footer-action">
          <button class="btn btn-primary btn-glow btn-large ${canBuy ? '' : 'btn-disabled'}" 
                  id="btn-confirm-free-agent" ${canBuy ? '' : 'disabled'}>
            💰 Conferma Acquisto & Svincolo
          </button>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    document.getElementById('btn-back-standings')?.addEventListener('click', () => {
      callbacks.navigate('standings');
    });

    document.getElementById('tab-trades')?.addEventListener('click', () => {
      activeTab = 'trades';
      renderMarketUI();
    });

    document.getElementById('tab-free-agents')?.addEventListener('click', () => {
      activeTab = 'freeAgents';
      renderMarketUI();
    });

    // Trades events
    document.getElementById('select-manager-a')?.addEventListener('change', (e) => {
      tradeManagerA = parseInt(e.target.value);
      selectedPlayerA = null;
      renderMarketUI();
    });

    document.getElementById('select-manager-b')?.addEventListener('change', (e) => {
      tradeManagerB = parseInt(e.target.value);
      selectedPlayerB = null;
      renderMarketUI();
    });

    container.querySelectorAll('[data-pick-a]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedPlayerA = parseInt(btn.dataset.pickA);
        renderMarketUI();
      });
    });

    container.querySelectorAll('[data-pick-b]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedPlayerB = parseInt(btn.dataset.pickB);
        renderMarketUI();
      });
    });

    document.getElementById('btn-confirm-trade')?.addEventListener('click', () => {
      if (!selectedPlayerA || !selectedPlayerB) return;
      const mgrA = gameState.managers[tradeManagerA];
      const mgrB = gameState.managers[tradeManagerB];

      // Esegui lo scambio
      mgrA.squad = mgrA.squad.filter(id => id !== selectedPlayerA);
      mgrA.squad.push(selectedPlayerB);

      mgrB.squad = mgrB.squad.filter(id => id !== selectedPlayerB);
      mgrB.squad.push(selectedPlayerA);

      // Rimuovi da formazioni se presenti
      mgrA.formation = (mgrA.formation || []).filter(id => id !== selectedPlayerA);
      mgrA.bench = (mgrA.bench || []).filter(id => id !== selectedPlayerA);
      mgrB.formation = (mgrB.formation || []).filter(id => id !== selectedPlayerB);
      mgrB.bench = (mgrB.bench || []).filter(id => id !== selectedPlayerB);

      // Registra operazione per possibile annullamento
      if (!gameState.marketHistory) gameState.marketHistory = [];
      gameState.marketHistory.push({
        type: 'trade',
        managerA: tradeManagerA,
        managerB: tradeManagerB,
        playerA: selectedPlayerA,
        playerB: selectedPlayerB,
        message: `Scambio ${mgrA.name} ⇄ ${mgrB.name}: ${getPlayer(selectedPlayerA).name} per ${getPlayer(selectedPlayerB).name}`
      });

      alert(`Scambio effettuato con successo!\n${getPlayer(selectedPlayerA).name} ⇄ ${getPlayer(selectedPlayerB).name}`);

      selectedPlayerA = null;
      selectedPlayerB = null;
      callbacks.saveGame();
      renderMarketUI();
    });

    // Annulla ultima operazione di mercato
    document.getElementById('btn-undo-market')?.addEventListener('click', () => {
      undoLastMarketOperation();
    });

    // Free agents events
    document.getElementById('select-fa-manager')?.addEventListener('change', (e) => {
      freeAgentManagerIdx = parseInt(e.target.value);
      selectedReleasePlayer = null;
      selectedBuyPlayer = null;
      renderMarketUI();
    });

    container.querySelectorAll('[data-fa-role]').forEach(btn => {
      btn.addEventListener('click', () => {
        freeAgentRoleFilter = btn.dataset.faRole;
        renderMarketUI();
      });
    });

    container.querySelectorAll('[data-rel-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.relId);
        selectedReleasePlayer = (selectedReleasePlayer === id) ? null : id;
        renderMarketUI();
      });
    });

    container.querySelectorAll('[data-buy-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.buyId);
        selectedBuyPlayer = (selectedBuyPlayer === id) ? null : id;
        renderMarketUI();
      });
    });

    document.getElementById('btn-cancel-release')?.addEventListener('click', () => {
      selectedReleasePlayer = null;
      renderMarketUI();
    });

    document.getElementById('btn-cancel-buy')?.addEventListener('click', () => {
      selectedBuyPlayer = null;
      renderMarketUI();
    });

    document.getElementById('btn-confirm-free-agent')?.addEventListener('click', () => {
      if (!selectedBuyPlayer) return;
      const mgr = gameState.managers[freeAgentManagerIdx];
      const buyP = getPlayer(selectedBuyPlayer);
      const relP = selectedReleasePlayer ? getPlayer(selectedReleasePlayer) : null;

      const gain = relP ? Math.max(1, Math.floor(relP.basePrice / 2)) : 0;
      const cost = buyP.basePrice;

      if (mgr.budget + gain < cost) {
        alert("Budget insufficiente per completare l'operazione!");
        return;
      }

      // Applica svincolo se presente
      if (relP) {
        mgr.squad = mgr.squad.filter(id => id !== relP.id);
        mgr.formation = (mgr.formation || []).filter(id => id !== relP.id);
        mgr.bench = (mgr.bench || []).filter(id => id !== relP.id);
        mgr.budget += gain;
      }

      // Applica acquisto
      mgr.squad.push(buyP.id);
      mgr.budget -= cost;

      // Registra operazione per possibile annullamento
      if (!gameState.marketHistory) gameState.marketHistory = [];
      gameState.marketHistory.push({
        type: 'freeAgent',
        managerIdx: freeAgentManagerIdx,
        buyPlayerId: buyP.id,
        relPlayerId: relP ? relP.id : null,
        cost: cost,
        gain: gain,
        message: `${mgr.name}: +${buyP.name} (-${cost}M)${relP ? ` e -${relP.name} (+${gain}M)` : ''}`
      });

      alert(`Operazione completata!\nHai acquistato ${buyP.name} per ${cost}M crediti${relP ? ` (svincolando ${relP.name} per +${gain}M)` : ''}.`);

      selectedReleasePlayer = null;
      selectedBuyPlayer = null;
      callbacks.saveGame();
      renderMarketUI();
    });
  }

  function undoLastMarketOperation() {
    if (!gameState.marketHistory || gameState.marketHistory.length === 0) return;
    const last = gameState.marketHistory[gameState.marketHistory.length - 1];
    const ok = confirm(`Vuoi annullare l'ultima operazione di mercato?\n"${last.message}"`);
    if (!ok) return;

    gameState.marketHistory.pop();

    if (last.type === 'trade') {
      const mgrA = gameState.managers[last.managerA];
      const mgrB = gameState.managers[last.managerB];
      mgrA.squad = mgrA.squad.filter(id => id !== last.playerB);
      mgrA.squad.push(last.playerA);

      mgrB.squad = mgrB.squad.filter(id => id !== last.playerA);
      mgrB.squad.push(last.playerB);
    } else if (last.type === 'freeAgent') {
      const mgr = gameState.managers[last.managerIdx];
      mgr.squad = mgr.squad.filter(id => id !== last.buyPlayerId);
      mgr.formation = (mgr.formation || []).filter(id => id !== last.buyPlayerId);
      mgr.bench = (mgr.bench || []).filter(id => id !== last.buyPlayerId);
      mgr.budget += last.cost;

      if (last.relPlayerId) {
        mgr.squad.push(last.relPlayerId);
        mgr.budget -= last.gain;
      }
    }

    callbacks.saveGame();
    renderMarketUI();
  }

  renderMarketUI();
}
