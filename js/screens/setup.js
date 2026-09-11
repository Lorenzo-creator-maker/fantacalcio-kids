// FantaCalcio Kids — Setup Lega & Regole Ufficiali

import { TEAM_COLORS } from '../data/players.js';

/**
 * Renderizza la schermata di setup: numero giocatori, nomi squadre, colori e opzioni regole
 */
export function renderSetup(container, gameState, callbacks) {
  let numManagers = 2;
  const managerData = [
    { name: '', color: 0 },
    { name: '', color: 1 },
    { name: '', color: 2 },
    { name: '', color: 3 },
  ];

  let rules = {
    initialBudget: 100,
    modifier: true,
    homeAdvantage: true,
    captainBonus: true,
    benchSubstitutions: true,
  };

  let showRulesPanel = false;

  function renderManagerInputs() {
    let html = '';
    for (let i = 0; i < numManagers; i++) {
      const m = managerData[i];
      html += `
        <div class="setup-manager" style="--manager-color: ${TEAM_COLORS[m.color].value}">
          <div class="setup-manager-header">
            <span class="setup-manager-icon">👤</span>
            <span class="setup-manager-label">Giocatore ${i + 1}</span>
          </div>
          <input 
            type="text" 
            class="setup-input" 
            id="manager-name-${i}" 
            placeholder="Nome squadra ${i + 1}..." 
            value="${m.name}"
            maxlength="20"
            autocomplete="off"
          />
          <div class="setup-colors" id="colors-${i}">
            ${TEAM_COLORS.map((c, ci) => `
              <button 
                class="color-btn ${ci === m.color ? 'color-selected' : ''}"
                data-manager="${i}" 
                data-color="${ci}"
                style="background: ${c.value}"
                title="${c.name}"
              ></button>
            `).join('')}
          </div>
        </div>
      `;
    }
    return html;
  }

  function render() {
    container.innerHTML = `
      <div class="screen screen-setup">
        <button class="btn-back" id="btn-back-home">← Indietro</button>
        
        <h1 class="screen-title">⚙️ Crea la tua Lega</h1>
        
        <div class="setup-section">
          <h2 class="setup-label">Quanti giocatori?</h2>
          <div class="setup-num-players">
            ${[2, 3, 4].map(n => `
              <button class="btn-num ${n === numManagers ? 'btn-num-active' : ''}" 
                      data-num="${n}">
                ${n} 👥
              </button>
            `).join('')}
          </div>
        </div>

        <div class="setup-section">
          <h2 class="setup-label">Le Squadre</h2>
          <div class="setup-managers" id="manager-inputs">
            ${renderManagerInputs()}
          </div>
        </div>

        <!-- Blocco Regole Lega Ufficiali -->
        <div class="setup-section setup-rules-section">
          <div class="rules-toggle-header" id="btn-toggle-rules">
            <span class="rules-header-title">📋 Regole Lega & Criteri Fantacalcio</span>
            <span class="rules-toggle-arrow">${showRulesPanel ? '▲ Nascondi' : '▼ Personalizza'}</span>
          </div>

          <div class="rules-panel ${showRulesPanel ? 'rules-panel-open' : 'rules-panel-closed'}" id="rules-panel">
            <div class="rule-row">
              <div class="rule-info">
                <span class="rule-title">💰 Budget Iniziale</span>
                <span class="rule-desc">Crediti per acquistare i campioni all'asta</span>
              </div>
              <div class="rule-options">
                ${[100, 250, 500].map(b => `
                  <button class="btn-option ${rules.initialBudget === b ? 'btn-option-active' : ''}" data-rule="initialBudget" data-val="${b}">${b}M</button>
                `).join('')}
              </div>
            </div>

            <div class="rule-row">
              <div class="rule-info">
                <span class="rule-title">🛡️ Modificatore Difesa</span>
                <span class="rule-desc">Bonus squadra per media voto portiere + 3 difensori (se modulo >= 4 difensori)</span>
              </div>
              <label class="switch-label">
                <input type="checkbox" id="rule-modifier" ${rules.modifier ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="rule-row">
              <div class="rule-info">
                <span class="rule-title">🏟️ Fattore Campo</span>
                <span class="rule-desc">+2.0 punti alla squadra che gioca in casa</span>
              </div>
              <label class="switch-label">
                <input type="checkbox" id="rule-home" ${rules.homeAdvantage ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="rule-row">
              <div class="rule-info">
                <span class="rule-title">⭐️ Bonus Capitano</span>
                <span class="rule-desc">+1 punto bonus per il capitano scelto se prende voto >= 6</span>
              </div>
              <label class="switch-label">
                <input type="checkbox" id="rule-captain" ${rules.captainBonus ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="rule-row">
              <div class="rule-info">
                <span class="rule-title">🪑 Panchina & Sostituzioni</span>
                <span class="rule-desc">Fino a 3 cambi automatici per giocatori S.V.</span>
              </div>
              <label class="switch-label">
                <input type="checkbox" id="rule-subs" ${rules.benchSubstitutions ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-glow btn-large" id="btn-start-auction" style="margin-top: 20px;">
          🎴 Inizia l'Asta!
        </button>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Event: cambio numero giocatori
    container.querySelectorAll('.btn-num').forEach(btn => {
      btn.addEventListener('click', () => {
        numManagers = parseInt(btn.dataset.num);
        render();
      });
    });

    // Event: cambio colore
    container.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mi = parseInt(btn.dataset.manager);
        const ci = parseInt(btn.dataset.color);
        managerData[mi].color = ci;
        render();
      });
    });

    // Event: toggle pannello regole
    document.getElementById('btn-toggle-rules')?.addEventListener('click', () => {
      showRulesPanel = !showRulesPanel;
      render();
    });

    // Event: opzione budget
    container.querySelectorAll('[data-rule="initialBudget"]').forEach(btn => {
      btn.addEventListener('click', () => {
        rules.initialBudget = parseInt(btn.dataset.val);
        render();
      });
    });

    // Event: switch regole
    document.getElementById('rule-modifier')?.addEventListener('change', (e) => {
      rules.modifier = e.target.checked;
    });
    document.getElementById('rule-home')?.addEventListener('change', (e) => {
      rules.homeAdvantage = e.target.checked;
    });
    document.getElementById('rule-captain')?.addEventListener('change', (e) => {
      rules.captainBonus = e.target.checked;
    });
    document.getElementById('rule-subs')?.addEventListener('change', (e) => {
      rules.benchSubstitutions = e.target.checked;
    });

    // Event: input nomi
    container.querySelectorAll('.setup-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.id.split('-').pop());
        managerData[idx].name = e.target.value;
      });
    });

    // Event: torna alla home
    document.getElementById('btn-back-home')?.addEventListener('click', () => {
      callbacks.navigate('home');
    });

    // Event: inizia asta
    document.getElementById('btn-start-auction')?.addEventListener('click', () => {
      const managers = [];
      let valid = true;

      for (let i = 0; i < numManagers; i++) {
        const nameInput = document.getElementById(`manager-name-${i}`);
        const name = nameInput?.value.trim();
        if (!name) {
          nameInput?.classList.add('input-error');
          nameInput?.focus();
          valid = false;
          break;
        }
        managers.push({
          id: i,
          name: name,
          color: TEAM_COLORS[managerData[i].color].value,
          colorLight: TEAM_COLORS[managerData[i].color].light,
          colorName: TEAM_COLORS[managerData[i].color].name,
          budget: rules.initialBudget,
          squad: [],
          formation: [],
          bench: [],
          captainId: null,
          module: '4-3-3',
          formationConfirmed: false,
        });
      }

      if (valid) {
        callbacks.startGame(managers, rules);
      }
    });

    // Focus sul primo input vuoto
    setTimeout(() => {
      for (let i = 0; i < numManagers; i++) {
        const input = document.getElementById(`manager-name-${i}`);
        if (input && !input.value) {
          input.focus();
          break;
        }
      }
    }, 100);
  }

  render();
}
