// FantaCalcio Kids — Asta Calciatori Ufficiale
// Regole: Asta per Ruolo (P ➡️ D ➡️ C ➡️ A), quote rosa (2 P, 6 D, 6 C, 4 A = 18 carte),
// salvaguardia budget minimo (1M a slot), rilanci rapidi (+1, +2, +5, +10) e input libero.

import { createCardHTML, ROLE_SHORT, ROLE_EMOJI, ROLE_LABELS, shuffleForAuction } from '../data/players.js';

const TARGET_ROLES = {
  P: 2, // 2 Portieri
  D: 6, // 6 Difensori
  C: 6, // 6 Centrocampisti
  A: 4, // 4 Attaccanti
};
const TOTAL_ROSTER_TARGET = 18;

export function renderAuction(container, gameState, callbacks) {
  // Se non c'è il mazzo o il filtro ruoli
  if (!gameState.auctionRole) {
    gameState.auctionRole = 'P'; // Inizia sempre dai Portieri come da tradizione
  }

  // Prepara i mazzi per ruolo se non presenti
  if (!gameState.auctionDecks) {
    gameState.auctionDecks = {
      P: shuffleForAuction(gameState.allPlayers.filter(p => p.role === 'P')),
      D: shuffleForAuction(gameState.allPlayers.filter(p => p.role === 'D')),
      C: shuffleForAuction(gameState.allPlayers.filter(p => p.role === 'C')),
      A: shuffleForAuction(gameState.allPlayers.filter(p => p.role === 'A')),
    };
    gameState.auctionRoleIndices = { P: 0, D: 0, C: 0, A: 0 };
  }

  let cardBidders = [];
  let currentLeader = null;
  let currentBid = 0;
  let askQueue = [];
  let auctionPhase = 'reveal'; // 'reveal' | 'bidding' | 'won' | 'skipped'

  function getActiveRole() {
    return gameState.auctionRole || 'P';
  }

  function getDeck(role) {
    return gameState.auctionDecks[role] || [];
  }

  function getIndex(role) {
    return gameState.auctionRoleIndices[role] || 0;
  }

  function getCurrentPlayer() {
    const role = getActiveRole();
    const deck = getDeck(role);
    const idx = getIndex(role);
    return deck[idx] || null;
  }

  function getManagerRoleCounts(managerIdx) {
    const squad = gameState.managers[managerIdx].squad;
    const counts = { P: 0, D: 0, C: 0, A: 0, total: squad.length };
    squad.forEach(pid => {
      const p = gameState.allPlayers.find(pl => pl.id === pid);
      if (p) counts[p.role]++;
    });
    return counts;
  }

  // Calcola l'offerta massima consentita per un manager
  // Regola aurea: deve rimanere almeno 1M per ogni slot mancante nella rosa
  function getMaxBid(managerIdx) {
    const m = gameState.managers[managerIdx];
    const totalMissing = Math.max(0, TOTAL_ROSTER_TARGET - m.squad.length);
    const reservedCredits = Math.max(0, totalMissing - 1);
    return Math.max(0, m.budget - reservedCredits);
  }

  function canManagerBidOnRole(managerIdx, role) {
    const counts = getManagerRoleCounts(managerIdx);
    const maxForRole = TARGET_ROLES[role] || 6;
    if (counts[role] >= maxForRole) return false;
    return getMaxBid(managerIdx) >= 1;
  }

  function isAuctionComplete() {
    return gameState.managers.every(m => m.squad.length >= 11);
  }

  function renderAuctionUI() {
    const role = getActiveRole();
    const deck = getDeck(role);
    const idx = getIndex(role);
    const player = getCurrentPlayer();

    const currentBidder = askQueue.length > 0 ? askQueue[0] : null;
    const currentManager = currentBidder !== null ? gameState.managers[currentBidder] : null;

    const lastPurchase = (gameState.auctionHistory && gameState.auctionHistory.length > 0)
      ? gameState.auctionHistory[gameState.auctionHistory.length - 1]
      : null;

    container.innerHTML = `
      <div class="screen screen-auction">
        <!-- Barra superiore navigazione e Annulla -->
        <div class="auction-top-bar">
          <button class="btn-back" id="btn-back-setup">← Setup Lega</button>
          <div class="auction-top-actions">
            ${idx > 0 ? `
              <button class="btn-undo" id="btn-prev-card" title="Torna alla carta precedente del ruolo ${ROLE_SHORT[role]}">
                ⏮️ Carta Prec.
              </button>
            ` : ''}
            ${lastPurchase ? `
              <button class="btn-undo" id="btn-undo-last-purchase" title="Annulla l'ultimo acquisto">
                ↩️ Annulla: ${lastPurchase.player.name} (${lastPurchase.bid}M a ${lastPurchase.managerName})
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Barra di selezione Ruolo -->
        <div class="auction-role-tabs">
          ${['P', 'D', 'C', 'A'].map(r => {
            const rDeck = getDeck(r);
            const rIdx = getIndex(r);
            const remaining = Math.max(0, rDeck.length - rIdx);
            return `
              <button class="auction-role-tab ${r === role ? 'active' : ''}" data-role="${r}">
                ${ROLE_EMOJI[r]} ${ROLE_SHORT[r]} (${remaining})
              </button>
            `;
          }).join('')}
        </div>

        <!-- Manager budgets & Quote Ruoli -->
        <div class="auction-budgets">
          ${gameState.managers.map((m, i) => {
            const counts = getManagerRoleCounts(i);
            const maxBid = getMaxBid(i);
            const isFullRole = counts[role] >= TARGET_ROLES[role];
            return `
              <div class="auction-budget ${currentBidder === i ? 'budget-active' : ''} ${currentLeader === i ? 'budget-leader' : ''}"
                   style="--mgr-color: ${m.color}">
                <div class="budget-name">${m.name}</div>
                <div class="budget-amount">
                  ${m.budget}M 💰
                  <button class="btn-bonus" data-manager="${i}" title="Aggiungi 10M">+10</button>
                </div>
                <div class="budget-quota">
                  <span class="${isFullRole ? 'quota-full' : ''}">${ROLE_SHORT[role]}: ${counts[role]}/${TARGET_ROLES[role]}</span>
                  <span class="quota-total">Tot: ${counts.total}/${TOTAL_ROSTER_TARGET}</span>
                </div>
                <div class="budget-max-bid">Max offerta: ${maxBid}M</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Area Carta Corrente -->
        <div class="auction-card-area" id="auction-card-area">
          ${!player ? `
            <div class="auction-role-finished animate-fade-in">
              <div class="arf-icon">${ROLE_EMOJI[role]}</div>
              <h2>Carte ${ROLE_LABELS[role]} Esaurite!</h2>
              <p>Seleziona un altro ruolo in alto per continuare l'asta.</p>
            </div>
          ` : ''}

          ${player && auctionPhase === 'reveal' ? `
            <div class="auction-card-wrapper">
              ${createCardHTML(player, { showPrice: true, flipped: true })}
            </div>
            <button class="btn btn-primary btn-glow btn-large auction-reveal-btn" id="btn-reveal">
              🎴 Chiama ${player.name} all'Asta!
            </button>
          ` : ''}

          ${player && auctionPhase === 'bidding' && currentManager ? `
            <div class="auction-card-wrapper card-animate-in">
              ${createCardHTML(player, { showPrice: true })}
            </div>

            <div class="auction-bid-info">
              <div class="bid-current">
                Offerta attuale: <strong>${currentBid}M</strong>
                ${currentLeader !== null ? `
                  <span class="bid-leader" style="color: ${gameState.managers[currentLeader].color}">
                    (${gameState.managers[currentLeader].name})
                  </span>
                ` : '<span class="bid-leader">(Prezzo Base)</span>'}
              </div>
            </div>

            <div class="auction-turn-banner" style="background: ${currentManager.color}">
              <span>Tocca a <strong>${currentManager.name}</strong>!</span>
            </div>

            <div class="auction-bid-actions">
              <div class="quick-bid-buttons">
                ${[1, 2, 5, 10].map(inc => {
                  const targetBid = currentLeader === null ? currentBid + (inc - 1) : currentBid + inc;
                  const canAfford = getMaxBid(currentBidder) >= targetBid;
                  return `
                    <button class="btn btn-quick-bid ${canAfford ? '' : 'btn-disabled'}" 
                            data-bid="${targetBid}" ${canAfford ? '' : 'disabled'}>
                      +${inc}M (${targetBid}M)
                    </button>
                  `;
                }).join('')}
              </div>

              <div class="auction-buttons">
                ${getMaxBid(currentBidder) >= (currentLeader === null ? currentBid : currentBid + 1) ? `
                  <button class="btn btn-bid" id="btn-bid">
                    ${currentLeader === null ? `OFFRO ${currentBid}M 💰` : `RILANCIO ${currentBid + 1}M 💰`}
                  </button>
                ` : `
                  <button class="btn btn-bid btn-disabled" disabled>
                    Limite Budget Raggiunto 🚫
                  </button>
                `}
                <button class="btn btn-pass" id="btn-pass">
                  PASSO ✋
                </button>
              </div>
            </div>
          ` : ''}

          ${player && auctionPhase === 'won' && currentLeader !== null ? `
            <div class="auction-card-wrapper card-won-animate">
              ${createCardHTML(player, { showPrice: true })}
            </div>
            <div class="auction-won-banner" style="background: ${gameState.managers[currentLeader].color}">
              🎉 <strong>${gameState.managers[currentLeader].name}</strong> compra ${player.name} per ${currentBid}M!
            </div>
            <div class="auction-buttons" style="margin-top: 16px;">
              <button class="btn btn-secondary" id="btn-undo-purchase">
                ↩️ Annulla
              </button>
              <button class="btn btn-primary btn-large" id="btn-next-card">
                Prossima Carta →
              </button>
            </div>
          ` : ''}

          ${player && auctionPhase === 'skipped' ? `
            <div class="auction-card-wrapper card-skip-animate">
              ${createCardHTML(player, { showPrice: true })}
            </div>
            <div class="auction-skipped-banner">
              Nessuno vuole ${player.name}! 😤
            </div>
            <div class="auction-buttons" style="margin-top: 16px;">
              <button class="btn btn-secondary" id="btn-retry-card">
                ↩️ Riprova
              </button>
              <button class="btn btn-primary btn-large" id="btn-next-card">
                Prossima Carta →
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Azioni di chiusura asta -->
        <div class="auction-footer-actions">
          <button class="btn btn-outline" id="btn-end-auction">
            ${isAuctionComplete() ? '✅ Completa Asta e Vai alla Formazione' : 'Termina Asta Anticipatamente'}
          </button>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Cambio ruolo tab
    container.querySelectorAll('.auction-role-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = btn.dataset.role;
        gameState.auctionRole = r;
        auctionPhase = 'reveal';
        currentLeader = null;
        currentBid = 0;
        cardBidders = [];
        askQueue = [];
        callbacks.saveGame();
        renderAuctionUI();
      });
    });

    // Bonus +10M
    container.querySelectorAll('.btn-bonus').forEach(btn => {
      btn.addEventListener('click', () => {
        const mIdx = parseInt(btn.dataset.manager);
        gameState.managers[mIdx].budget += 10;
        callbacks.saveGame();
        renderAuctionUI();
      });
    });

    // Scopri carta
    document.getElementById('btn-reveal')?.addEventListener('click', () => {
      auctionPhase = 'bidding';
      startBiddingForCurrentCard();
    });

    // Rilancio normale (+1)
    document.getElementById('btn-bid')?.addEventListener('click', () => {
      handleBid();
    });

    // Rilanci rapidi (+1, +2, +5, +10)
    container.querySelectorAll('.btn-quick-bid').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetBid = parseInt(btn.dataset.bid);
        handleCustomBid(targetBid);
      });
    });

    // Passo
    document.getElementById('btn-pass')?.addEventListener('click', () => {
      handlePass();
    });

    // Prossima carta
    document.getElementById('btn-next-card')?.addEventListener('click', () => {
      const role = getActiveRole();
      gameState.auctionRoleIndices[role] = (gameState.auctionRoleIndices[role] || 0) + 1;
      auctionPhase = 'reveal';
      currentLeader = null;
      currentBid = 0;
      cardBidders = [];
      askQueue = [];
      callbacks.saveGame();
      renderAuctionUI();
    });

    // Riprova carta
    document.getElementById('btn-retry-card')?.addEventListener('click', () => {
      auctionPhase = 'reveal';
      currentLeader = null;
      currentBid = 0;
      cardBidders = [];
      askQueue = [];
      renderAuctionUI();
    });

    // Annulla acquisto
    document.getElementById('btn-undo-purchase')?.addEventListener('click', () => {
      undoPurchase();
    });

    // Torna al setup
    document.getElementById('btn-back-setup')?.addEventListener('click', () => {
      goBackToSetup();
    });

    // Carta precedente
    document.getElementById('btn-prev-card')?.addEventListener('click', () => {
      prevCard();
    });

    // Annulla ultimo acquisto dallo storico
    document.getElementById('btn-undo-last-purchase')?.addEventListener('click', () => {
      undoLastAuctionPurchase();
    });

    // Termina asta
    document.getElementById('btn-end-auction')?.addEventListener('click', () => {
      finishAuction();
    });
  }

  function goBackToSetup() {
    const hasBought = gameState.managers.some(m => (m.squad || []).length > 0);
    if (hasBought) {
      const ok = confirm("Attenzione: tornando al setup azzererai l'asta in corso. Vuoi davvero tornare al setup?");
      if (!ok) return;
    }
    callbacks.navigate('setup');
  }

  function prevCard() {
    const role = getActiveRole();
    const currentIdx = getIndex(role);
    if (currentIdx > 0) {
      gameState.auctionRoleIndices[role] = currentIdx - 1;
      auctionPhase = 'reveal';
      currentLeader = null;
      currentBid = 0;
      cardBidders = [];
      askQueue = [];
      callbacks.saveGame();
      renderAuctionUI();
    }
  }

  function undoLastAuctionPurchase() {
    if (!gameState.auctionHistory || gameState.auctionHistory.length === 0) return;
    const last = gameState.auctionHistory[gameState.auctionHistory.length - 1];
    const confirmUndo = confirm(`Vuoi annullare l'acquisto di ${last.player.name} da parte di ${last.managerName} per ${last.bid}M?`);
    if (!confirmUndo) return;

    gameState.auctionHistory.pop();
    const manager = gameState.managers[last.managerIdx];
    if (manager) {
      const pIdx = manager.squad.lastIndexOf(last.player.id);
      if (pIdx !== -1) {
        manager.squad.splice(pIdx, 1);
      }
      manager.budget += last.bid;
    }

    gameState.auctionRole = last.role;
    gameState.auctionRoleIndices[last.role] = last.roleIndex;

    auctionPhase = 'reveal';
    currentLeader = null;
    currentBid = 0;
    cardBidders = [];
    askQueue = [];

    callbacks.saveGame();
    renderAuctionUI();
  }

  function startBiddingForCurrentCard() {
    const player = getCurrentPlayer();
    if (!player) return;

    currentBid = Math.max(1, player.basePrice);
    currentLeader = null;

    // Filtra manager che possono permettersi il prezzo base E non hanno il ruolo pieno
    cardBidders = gameState.managers
      .map((_, i) => i)
      .filter(i => canManagerBidOnRole(i, player.role) && getMaxBid(i) >= currentBid);

    if (cardBidders.length === 0) {
      auctionPhase = 'skipped';
      renderAuctionUI();
      return;
    }

    // Ruota chi parte per equità
    const role = getActiveRole();
    const startOffset = (gameState.auctionRoleIndices[role] || 0) % cardBidders.length;
    askQueue = [
      ...cardBidders.slice(startOffset),
      ...cardBidders.slice(0, startOffset),
    ];

    renderAuctionUI();
  }

  function handleBid() {
    if (askQueue.length === 0) return;
    const nextBid = currentLeader === null ? currentBid : currentBid + 1;
    handleCustomBid(nextBid);
  }

  function handleCustomBid(bidAmount) {
    if (askQueue.length === 0) return;
    const bidder = askQueue.shift();

    currentBid = bidAmount;
    currentLeader = bidder;

    // Ricostruisci la coda con i manager attivi che possono rilanciare ad almeno currentBid + 1
    askQueue = cardBidders
      .filter(m => m !== currentLeader && getMaxBid(m) >= currentBid + 1);

    if (askQueue.length === 0) {
      winCard();
      return;
    }

    renderAuctionUI();
  }

  function handlePass() {
    if (askQueue.length === 0) return;
    const passer = askQueue.shift();
    cardBidders = cardBidders.filter(m => m !== passer);

    if (cardBidders.length === 0) {
      auctionPhase = 'skipped';
      renderAuctionUI();
      return;
    }

    if (cardBidders.length === 1 && currentLeader !== null) {
      winCard();
      return;
    }

    if (askQueue.length === 0) {
      if (currentLeader !== null) {
        winCard();
      } else {
        auctionPhase = 'skipped';
        renderAuctionUI();
      }
      return;
    }

    renderAuctionUI();
  }

  function winCard() {
    if (currentLeader === null) return;
    const player = getCurrentPlayer();
    const manager = gameState.managers[currentLeader];

    manager.squad.push(player.id);
    manager.budget -= currentBid;

    if (!gameState.auctionHistory) gameState.auctionHistory = [];
    gameState.auctionHistory.push({
      player: { ...player },
      managerIdx: currentLeader,
      managerName: manager.name,
      bid: currentBid,
      role: getActiveRole(),
      roleIndex: getIndex(getActiveRole())
    });

    auctionPhase = 'won';
    callbacks.saveGame();
    renderAuctionUI();
  }

  function undoPurchase() {
    if (currentLeader === null) return;
    if (gameState.auctionHistory && gameState.auctionHistory.length > 0) {
      gameState.auctionHistory.pop();
    }
    const manager = gameState.managers[currentLeader];
    manager.squad.pop();
    manager.budget += currentBid;

    auctionPhase = 'reveal';
    currentLeader = null;
    currentBid = 0;
    cardBidders = [];
    askQueue = [];
    callbacks.saveGame();
    renderAuctionUI();
  }

  function finishAuction() {
    const allHaveEleven = gameState.managers.every(m => m.squad.length >= 11);
    if (!allHaveEleven) {
      const confirmEnd = confirm("Attenzione: qualche squadra ha meno di 11 calciatori.\nVuoi terminare comunque l'asta?");
      if (!confirmEnd) return;
    }
    callbacks.navigate('formation');
  }

  renderAuctionUI();
}
