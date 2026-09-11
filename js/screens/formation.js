// FantaCalcio Kids — Schermata Formazione Ufficiale
// 11 Titolari su campo interattivo, Selezione Capitano ⭐️, Panchina (7 riserve) e Panchina Rapida ⚡

import { createCardHTML, ROLE_LABELS, ROLE_EMOJI, ROLE_SHORT } from '../data/players.js';

const FORMATIONS = {
  '4-3-3': { P: 1, D: 4, C: 3, A: 3 },
  '3-4-3': { P: 1, D: 3, C: 4, A: 3 },
  '4-4-2': { P: 1, D: 4, C: 4, A: 2 },
  '3-5-2': { P: 1, D: 3, C: 5, A: 2 },
  '4-5-1': { P: 1, D: 4, C: 5, A: 1 },
  '5-3-2': { P: 1, D: 5, C: 3, A: 2 },
  '5-4-1': { P: 1, D: 5, C: 4, A: 1 }
};

const BENCH_CONFIG = {
  P: 1,
  D: 2,
  C: 2,
  A: 2,
};
const TOTAL_STARTERS = 11;
const TOTAL_BENCH = 7;

function getFormationConfig(moduleName) {
  const f = FORMATIONS[moduleName] || FORMATIONS['4-3-3'];
  return {
    P: { required: f.P, label: 'Portiere', positions: ['POR'] },
    D: { required: f.D, label: 'Difensori', positions: Array(f.D).fill(0).map((_,i) => `DIF${i+1}`) },
    C: { required: f.C, label: 'Centrocampisti', positions: Array(f.C).fill(0).map((_,i) => `CEN${i+1}`) },
    A: { required: f.A, label: 'Attaccanti', positions: Array(f.A).fill(0).map((_,i) => `ATT${i+1}`) },
  };
}

export function renderFormation(container, gameState, callbacks) {
  let activeManagerIdx = gameState.managers.findIndex(m => !m.formationConfirmed);
  if (activeManagerIdx === -1) {
    activeManagerIdx = 0;
  }

  let manager = gameState.managers[activeManagerIdx];
  let currentModule = manager.module || '4-3-3';
  let FORMATION = getFormationConfig(currentModule);

  let selectedStarterIds = [...(manager.formation || [])];
  let selectedBenchIds = [...(manager.bench || [])];
  let captainId = manager.captainId || null;

  // Se il capitano non è più nei titolari, resettalo
  if (captainId && !selectedStarterIds.includes(captainId)) {
    captainId = selectedStarterIds[0] || null;
  }

  function switchManager(newIdx) {
    // Salva lo stato di lavoro corrente per non perdere le scelte
    manager.formation = [...selectedStarterIds];
    manager.bench = [...selectedBenchIds];
    manager.captainId = captainId || selectedStarterIds[0] || null;
    manager.module = currentModule;

    activeManagerIdx = newIdx;
    manager = gameState.managers[activeManagerIdx];
    currentModule = manager.module || '4-3-3';
    FORMATION = getFormationConfig(currentModule);
    selectedStarterIds = [...(manager.formation || [])];
    selectedBenchIds = [...(manager.bench || [])];
    captainId = manager.captainId || null;
    if (captainId && !selectedStarterIds.includes(captainId)) {
      captainId = selectedStarterIds[0] || null;
    }
    renderFormationUI();
  }

  function getSquadPlayer(id) {
    return gameState.allPlayers.find(p => p.id === id);
  }

  function getSquadByRole(role) {
    return (manager.squad || [])
      .map(getSquadPlayer)
      .filter(p => p && p.role === role)
      .sort((a, b) => b.rating - a.rating);
  }

  function getStartersByRole(role) {
    return selectedStarterIds
      .map(getSquadPlayer)
      .filter(p => p && p.role === role);
  }

  function getBenchByRole(role) {
    return selectedBenchIds
      .map(getSquadPlayer)
      .filter(p => p && p.role === role);
  }

  function isStarter(pid) {
    return selectedStarterIds.includes(pid);
  }

  function isBench(pid) {
    return selectedBenchIds.includes(pid);
  }

  function canSelectMoreStarter(role) {
    return getStartersByRole(role).length < FORMATION[role].required;
  }

  function canSelectMoreBench(role) {
    return getBenchByRole(role).length < (BENCH_CONFIG[role] || 2);
  }

  // Panchina Rapida: riempie automaticamente le riserve con i migliori rimasti
  function autoFillBench() {
    selectedBenchIds = [];
    ['P', 'D', 'C', 'A'].forEach(role => {
      const needed = BENCH_CONFIG[role] || 2;
      const available = getSquadByRole(role).filter(p => !selectedStarterIds.includes(p.id));
      const chosen = available.slice(0, needed);
      chosen.forEach(p => selectedBenchIds.push(p.id));
    });
  }

  function renderFormationUI() {
    const isStartersComplete = Object.keys(FORMATION).every(role => {
      const selected = getStartersByRole(role).length;
      const required = FORMATION[role].required;
      const inSquad = getSquadByRole(role).length;
      return selected === required || selected === inSquad;
    }) && (selectedStarterIds.length === TOTAL_STARTERS || selectedStarterIds.length === manager.squad.length);

    // Ordina titolari per modulo
    const sortedStarters = selectedStarterIds
      .map(getSquadPlayer)
      .filter(Boolean)
      .sort((a, b) => {
        const order = { P: 1, D: 2, C: 3, A: 4 };
        if (order[a.role] !== order[b.role]) return order[a.role] - order[b.role];
        return b.rating - a.rating;
      });

    // Griglia campo
    function renderPitchRow(role) {
      const count = FORMATION[role].required;
      const roleStarters = sortedStarters.filter(p => p.role === role);
      let html = '';
      for (let i = 0; i < count; i++) {
        const player = roleStarters[i];
        if (player) {
          const isCap = player.id === captainId;
          html += `
            <div class="pitch-slot pitch-slot-filled ${isCap ? 'slot-captain' : ''}" data-player-id="${player.id}">
              ${isCap ? '<div class="pitch-captain-badge">⭐️ C</div>' : ''}
              <div class="pitch-slot-avatar">${ROLE_EMOJI[player.role]}</div>
              <div class="pitch-slot-name">${player.name}</div>
              <button class="pitch-set-captain" data-player-id="${player.id}" title="Fai Capitano">
                ${isCap ? '👑 Capitano' : '⭐️ Fai C'}
              </button>
            </div>
          `;
        } else {
          html += `
            <div class="pitch-slot pitch-slot-empty" data-role="${role}">
              <div class="pitch-slot-avatar">?</div>
              <div class="pitch-slot-name">${FORMATION[role].positions[i] || ROLE_SHORT[role]}</div>
            </div>
          `;
        }
      }
      return html;
    }

    const allOthersConfirmed = gameState.managers.every((m, i) => i === activeManagerIdx || m.formationConfirmed);

    container.innerHTML = `
      <div class="screen screen-formation">
        <!-- Barra superiore con Torna Indietro -->
        <div class="screen-top-bar">
          <button class="btn-back" id="btn-back-phase">
            ${gameState.currentRound === 0 ? '← Torna all\'Asta' : '← Torna alla Classifica'}
          </button>
          ${activeManagerIdx > 0 ? `
            <button class="btn-back" id="btn-prev-manager-top">
              ← ${gameState.managers[activeManagerIdx - 1].name}
            </button>
          ` : ''}
        </div>

        <!-- Selettore Tab Manager per navigare liberamente -->
        <div class="formation-manager-tabs">
          ${gameState.managers.map((m, idx) => {
            const isDone = m.formationConfirmed;
            const isCurrent = idx === activeManagerIdx;
            return `
              <button class="formation-mgr-tab ${isCurrent ? 'active' : ''} ${isDone ? 'confirmed' : ''}"
                      data-mgr-tab="${idx}"
                      style="--mgr-color: ${m.color}">
                <span class="tab-status-icon">${isDone ? '✅' : '⏳'}</span>
                <span>${m.name}</span>
              </button>
            `;
          }).join('')}
        </div>

        <div class="formation-header" style="background: ${manager.color}">
          <h1 class="formation-title">📋 Schiera la Formazione</h1>
          <div class="formation-manager-name">${manager.name}</div>
          <div class="formation-turn-tag">
            Squadra ${activeManagerIdx + 1} di ${gameState.managers.length}
            ${manager.formationConfirmed ? ' — Confermata ✅' : ''}
          </div>
          
          <div class="formation-module-box">
            <label for="module-select">Modulo Tattico:</label>
            <select id="module-select" class="module-select">
              ${Object.keys(FORMATIONS).map(m => `
                <option value="${m}" ${m === currentModule ? 'selected' : ''}>Modulo ${m}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Campo da Calcio con i Titolari -->
        <div class="formation-pitch">
          <div class="pitch-bg">
            <div class="pitch-center-line"></div>
            <div class="pitch-circle"></div>
            <div class="pitch-area pitch-area-top"></div>
            <div class="pitch-area pitch-area-bottom"></div>
          </div>

          <!-- Attacco -->
          <div class="pitch-row pitch-row-att">
            ${renderPitchRow('A')}
          </div>

          <!-- Centrocampo -->
          <div class="pitch-row pitch-row-cen">
            ${renderPitchRow('C')}
          </div>

          <!-- Difesa -->
          <div class="pitch-row pitch-row-dif">
            ${renderPitchRow('D')}
          </div>

          <!-- Portiere -->
          <div class="pitch-row pitch-row-por">
            ${renderPitchRow('P')}
          </div>
        </div>

        <!-- Info Capitano -->
        <div class="formation-captain-indicator">
          <span class="fci-icon">⭐️</span>
          <span class="fci-text">
            Capitano: <strong>${captainId ? getSquadPlayer(captainId)?.name || 'Nessuno' : 'Seleziona un titolare'}</strong>
            <small>(+1 pt bonus se voto >= 6)</small>
          </span>
        </div>

        <!-- Panchina (7 riserve) -->
        <div class="formation-bench-container">
          <div class="bench-header">
            <div class="bench-title">
              <span>🪑 Panchina (${selectedBenchIds.length}/${TOTAL_BENCH})</span>
              <small>Subentrano per Senza Voto (S.V.)</small>
            </div>
            <button class="btn btn-secondary btn-small" id="btn-quick-bench">
              ⚡ Panchina Rapida
            </button>
          </div>

          <div class="bench-slots-preview">
            ${['P', 'D', 'C', 'A'].map(role => {
              const benchPlayers = getBenchByRole(role);
              const maxNeeded = BENCH_CONFIG[role];
              return `
                <div class="bench-role-group">
                  <span class="bench-role-label">${ROLE_EMOJI[role]} ${ROLE_SHORT[role]}:</span>
                  ${benchPlayers.map(p => `
                    <span class="bench-chip" data-player-id="${p.id}">
                      ${p.name} <button class="bench-chip-remove" data-remove-bench="${p.id}">✕</button>
                    </span>
                  `).join('')}
                  ${benchPlayers.length < maxNeeded ? `<span class="bench-chip-empty">+ Riserva</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Lista Carte Rosa divise per Ruolo -->
        <div class="formation-selection">
          <h2 class="formation-section-subtitle">Tocca una carta per schierarla tra i Titolari o in Panchina</h2>
          ${['P', 'D', 'C', 'A'].map(role => {
            const players = getSquadByRole(role);
            const starters = getStartersByRole(role);
            const neededStarters = FORMATION[role].required;

            return `
              <div class="formation-role-section">
                <div class="role-section-header">
                  <span class="role-section-title">${ROLE_EMOJI[role]} ${ROLE_LABELS[role]}</span>
                  <span class="role-count-badge">Titolari: ${starters.length}/${neededStarters}</span>
                </div>

                <div class="formation-cards-row">
                  ${players.map(p => {
                    const isTitolare = isStarter(p.id);
                    const isPanchinaro = isBench(p.id);
                    const isCap = p.id === captainId;

                    return `
                      <div class="formation-card-item">
                        <div class="formation-card-click-area" data-player-id="${p.id}">
                          ${createCardHTML(p, { 
                            small: true, 
                            selected: isTitolare,
                            isCaptain: isCap,
                            isBench: isPanchinaro,
                            badgeText: isTitolare ? 'TITOLARE' : isPanchinaro ? 'PANCHINA' : null
                          })}
                        </div>
                        <div class="card-action-buttons">
                          ${isTitolare ? `
                            <button class="btn-card-action btn-make-captain ${isCap ? 'active' : ''}" data-captain-id="${p.id}">
                              ${isCap ? '👑 CAPITANO' : '⭐️ Fai C'}
                            </button>
                            <button class="btn-card-action btn-move-bench" data-move-bench="${p.id}">
                              ⬇️ Panchina
                            </button>
                          ` : isPanchinaro ? `
                            <button class="btn-card-action btn-move-starter" data-move-starter="${p.id}">
                              ⬆️ Titolare
                            </button>
                            <button class="btn-card-action btn-remove" data-remove-bench="${p.id}">
                              ✕ Togli
                            </button>
                          ` : `
                            <button class="btn-card-action btn-add-starter" data-move-starter="${p.id}">
                              ⬆️ Titolare
                            </button>
                            <button class="btn-card-action btn-add-bench" data-move-bench="${p.id}">
                              🪑 Panchina
                            </button>
                          `}
                        </div>
                      </div>
                    `;
                  }).join('')}
                  ${players.length === 0 ? '<div class="no-players">Nessun giocatore in questo ruolo</div>' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer con conferma -->
        <div class="formation-footer">
          <div class="formation-counter">
            Titolari: <strong>${selectedStarterIds.length}</strong> / ${TOTAL_STARTERS} | Riserve: <strong>${selectedBenchIds.length}</strong> / ${TOTAL_BENCH}
          </div>
          <div style="display: flex; gap: 10px; width: 100%;">
            ${activeManagerIdx > 0 ? `
              <button class="btn btn-secondary" id="btn-prev-mgr-footer" style="flex: 1;">
                ← ${gameState.managers[activeManagerIdx - 1].name}
              </button>
            ` : ''}
            <button class="btn btn-primary btn-glow btn-large ${isStartersComplete ? '' : 'btn-disabled'}" 
                    id="btn-confirm-formation"
                    ${isStartersComplete ? '' : 'disabled'}
                    style="flex: 2;">
              ${allOthersConfirmed ? '✅ Salva e Inizia Partita ⚽' : `✅ Conferma ${manager.name} →`}
            </button>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Cambio Modulo
    document.getElementById('module-select')?.addEventListener('change', (e) => {
      currentModule = e.target.value;
      FORMATION = getFormationConfig(currentModule);
      selectedStarterIds = [];
      captainId = null;
      renderFormationUI();
    });

    // Panchina Rapida
    document.getElementById('btn-quick-bench')?.addEventListener('click', () => {
      autoFillBench();
      renderFormationUI();
    });

    // Assegna capitano da campo o da pulsante
    container.querySelectorAll('[data-captain-id], .pitch-set-captain').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = parseInt(btn.dataset.captainId || btn.dataset.playerId);
        if (selectedStarterIds.includes(pid)) {
          captainId = pid;
          renderFormationUI();
        }
      });
    });

    // Sposta a titolare
    container.querySelectorAll('[data-move-starter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = parseInt(btn.dataset.moveStarter);
        const player = getSquadPlayer(pid);
        if (!player) return;

        // Se era in panchina, rimuovilo
        selectedBenchIds = selectedBenchIds.filter(id => id !== pid);

        if (!selectedStarterIds.includes(pid)) {
          if (canSelectMoreStarter(player.role)) {
            selectedStarterIds.push(pid);
            if (!captainId) captainId = pid; // Primo titolare di default capitano
          } else {
            alert(`Hai già raggiunto il limite di ${FORMATION[player.role].required} titolari in questo ruolo per il modulo ${currentModule}!`);
          }
        }
        renderFormationUI();
      });
    });

    // Sposta a panchina
    container.querySelectorAll('[data-move-bench]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = parseInt(btn.dataset.moveBench);
        const player = getSquadPlayer(pid);
        if (!player) return;

        // Se era titolare, rimuovilo
        selectedStarterIds = selectedStarterIds.filter(id => id !== pid);
        if (captainId === pid) {
          captainId = selectedStarterIds[0] || null;
        }

        if (!selectedBenchIds.includes(pid)) {
          if (canSelectMoreBench(player.role)) {
            selectedBenchIds.push(pid);
          } else {
            alert(`Hai già ${BENCH_CONFIG[player.role]} riserve in questo ruolo in panchina!`);
          }
        }
        renderFormationUI();
      });
    });

    // Rimuovi da panchina
    container.querySelectorAll('[data-remove-bench]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = parseInt(btn.dataset.removeBench);
        selectedBenchIds = selectedBenchIds.filter(id => id !== pid);
        renderFormationUI();
      });
    });

    // Tocco diretto sulla carta per toggle titolare
    container.querySelectorAll('.formation-card-click-area').forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        const pid = parseInt(wrapper.dataset.playerId);
        const player = getSquadPlayer(pid);
        if (!player) return;

        if (isStarter(pid)) {
          selectedStarterIds = selectedStarterIds.filter(id => id !== pid);
          if (captainId === pid) captainId = selectedStarterIds[0] || null;
        } else if (isBench(pid)) {
          selectedBenchIds = selectedBenchIds.filter(id => id !== pid);
        } else if (canSelectMoreStarter(player.role)) {
          selectedStarterIds.push(pid);
          if (!captainId) captainId = pid;
        } else if (canSelectMoreBench(player.role)) {
          selectedBenchIds.push(pid);
        }
        renderFormationUI();
      });
    });

    // Torna alla fase precedente
    document.getElementById('btn-back-phase')?.addEventListener('click', () => {
      if (gameState.currentRound === 0) {
        const ok = confirm("Vuoi tornare all'asta dei calciatori? Le tue scelte di formazione rimarranno salvate.");
        if (!ok) return;
        callbacks.navigate('auction');
      } else {
        callbacks.navigate('standings');
      }
    });

    // Squadra precedente
    document.getElementById('btn-prev-manager-top')?.addEventListener('click', () => {
      if (activeManagerIdx > 0) switchManager(activeManagerIdx - 1);
    });
    document.getElementById('btn-prev-mgr-footer')?.addEventListener('click', () => {
      if (activeManagerIdx > 0) switchManager(activeManagerIdx - 1);
    });

    // Selettore Tab Manager
    container.querySelectorAll('[data-mgr-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetIdx = parseInt(btn.dataset.mgrTab);
        if (targetIdx !== activeManagerIdx) {
          switchManager(targetIdx);
        }
      });
    });

    // Conferma Formazione
    document.getElementById('btn-confirm-formation')?.addEventListener('click', () => {
      // Se manca la panchina, auto-riempila automaticamente
      if (selectedBenchIds.length === 0) {
        autoFillBench();
      }

      manager.formation = [...selectedStarterIds];
      manager.bench = [...selectedBenchIds];
      manager.captainId = captainId || selectedStarterIds[0] || null;
      manager.module = currentModule;
      manager.formationConfirmed = true;
      callbacks.saveGame();

      // Prossimo manager o vai al Matchday se tutti confermati
      const nextIdx = gameState.managers.findIndex(m => !m.formationConfirmed);
      if (nextIdx === -1) {
        callbacks.navigate('matchday');
      } else {
        switchManager(nextIdx);
      }
    });
  }

  renderFormationUI();
}
