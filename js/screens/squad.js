// FantaCalcio Kids — Visualizzazione Rosa Squadra Ufficiale
// Distinzione tra Titolari, Capitano ⭐️, Panchina 🪑 e Tribuna

import { createCardHTML, ROLE_EMOJI, ROLE_LABELS } from '../data/players.js';

export function renderSquad(container, gameState, callbacks) {
  let viewingManagerIdx = 0;

  function getPlayer(id) {
    return gameState.allPlayers.find(p => p.id === id);
  }

  function render() {
    const manager = gameState.managers[viewingManagerIdx];
    const squadPlayers = (manager.squad || []).map(getPlayer).filter(Boolean);

    const starters = (manager.formation || []).map(getPlayer).filter(Boolean);
    const bench = (manager.bench || []).map(getPlayer).filter(Boolean);
    const tribuna = squadPlayers.filter(p => !manager.formation?.includes(p.id) && !manager.bench?.includes(p.id));

    const avgRating = squadPlayers.length > 0 
      ? (squadPlayers.reduce((s, p) => s + p.rating, 0) / squadPlayers.length).toFixed(1)
      : '0';

    const backTarget = gameState.previousPhase === 'end' ? 'end' : 'standings';
    const backLabel = gameState.previousPhase === 'end' ? '← Torna alla Premiazione' : '← Torna alla Classifica';

    container.innerHTML = `
      <div class="screen screen-squad">
        <button class="btn-back" id="btn-back-screen">${backLabel}</button>

        <h1 class="screen-title">🃏 Le Rose</h1>

        <!-- Tab per ogni manager -->
        <div class="squad-tabs">
          ${gameState.managers.map((m, i) => `
            <button class="squad-tab ${i === viewingManagerIdx ? 'squad-tab-active' : ''}"
                    data-idx="${i}"
                    style="--mgr-color: ${m.color}">
              ${m.name}
            </button>
          `).join('')}
        </div>

        <!-- Dettagli squadra -->
        <div class="squad-info" style="--mgr-color: ${manager.color}">
          <div class="squad-info-row">
            <span>💰 Budget: <strong>${manager.budget}M</strong></span>
            <span>🃏 Carte: <strong>${squadPlayers.length}</strong></span>
            <span>⭐ Rating Medio: <strong>${avgRating}</strong></span>
            <span>Modulo: <strong>${manager.module || '4-3-3'}</strong></span>
          </div>
        </div>

        <!-- Sezione 1: 11 Titolari & Capitano -->
        <div class="squad-section-group">
          <h2 class="squad-group-title">
            ⚽ 11 Titolari & Capitano (${starters.length}/11)
          </h2>
          <div class="squad-cards-grid">
            ${starters.map(p => {
              const isCap = p.id === manager.captainId;
              return `
                <div class="squad-card-item in-formation">
                  ${createCardHTML(p, { small: true, selected: true, isCaptain: isCap })}
                  <div class="formation-badge ${isCap ? 'cap-badge' : ''}">
                    ${isCap ? '👑 CAPITANO' : 'TITOLARE'}
                  </div>
                </div>
              `;
            }).join('')}
            ${starters.length === 0 ? '<div class="no-players">Nessun titolare schierato</div>' : ''}
          </div>
        </div>

        <!-- Sezione 2: Panchina -->
        <div class="squad-section-group">
          <h2 class="squad-group-title">
            🪑 Panchina (${bench.length}/7)
          </h2>
          <div class="squad-cards-grid">
            ${bench.map(p => `
              <div class="squad-card-item in-bench">
                ${createCardHTML(p, { small: true, isBench: true })}
                <div class="bench-badge-tag">RISERVA</div>
              </div>
            `).join('')}
            ${bench.length === 0 ? '<div class="no-players">Nessun panchinaro selezionato</div>' : ''}
          </div>
        </div>

        <!-- Sezione 3: Tribuna (extra) -->
        ${tribuna.length > 0 ? `
          <div class="squad-section-group">
            <h2 class="squad-group-title">
              🏟️ Tribuna (${tribuna.length})
            </h2>
            <div class="squad-cards-grid">
              ${tribuna.map(p => `
                <div class="squad-card-item in-tribuna">
                  ${createCardHTML(p, { small: true })}
                  <div class="tribuna-badge-tag">TRIBUNA</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Event: cambio tab
    container.querySelectorAll('.squad-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        viewingManagerIdx = parseInt(tab.dataset.idx);
        render();
      });
    });

    // Event: torna indietro
    document.getElementById('btn-back-screen')?.addEventListener('click', () => {
      callbacks.navigate(backTarget);
    });
  }

  render();
}
