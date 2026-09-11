// FantaCalcio Kids — Schermata Classifica & Capocannonieri Ufficiale
// Regole: Classifica completa (Pt, G, V, P, S, GF, GS, DR, FantaPt), Tab Capocannonieri, Mercato & Scambi

import { calculateTopScorers } from '../utils/scoring.js';
import { ROLE_EMOJI, ROLE_SHORT } from '../data/players.js';

export function renderStandings(container, gameState, callbacks) {
  let activeTab = 'standings'; // 'standings' | 'topscorers'

  // Ordina classifica per: 1. Punti, 2. Differenza Reti, 3. Gol Fatti, 4. Fantapunti Totali
  const sortedStandings = [...gameState.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.totalScore - a.totalScore;
  });

  const isLastRound = gameState.currentRound >= gameState.schedule.length - 1;
  const currentRound = gameState.currentRound + 1;
  const totalRounds = gameState.schedule.length;
  const topScorers = calculateTopScorers(gameState.results || [], gameState.allPlayers);

  function renderUI() {
    container.innerHTML = `
      <div class="screen screen-standings">
        <h1 class="screen-title">🏆 Classifica & Statistiche</h1>
        <div class="standings-round-info">
          Dopo la Giornata ${currentRound} di ${totalRounds}
        </div>

        <!-- Tab Navigazione -->
        <div class="standings-tabs">
          <button class="st-tab ${activeTab === 'standings' ? 'active' : ''}" id="tab-btn-standings">
            🏆 Classifica Campionato
          </button>
          <button class="st-tab ${activeTab === 'topscorers' ? 'active' : ''}" id="tab-btn-topscorers">
            ⚽ Classifica Marcatori (${topScorers.length})
          </button>
        </div>

        ${activeTab === 'standings' ? renderStandingsTable() : renderTopScorersTable()}

        <!-- Risultati della Giornata -->
        ${renderRoundResults()}

        <!-- Pulsanti Navigazione -->
        <div class="standings-buttons">
          ${!isLastRound ? `
            <button class="btn btn-primary btn-glow btn-large" id="btn-next-round">
              ⚽ Giornata ${currentRound + 1} →
            </button>
          ` : `
            <button class="btn btn-primary btn-glow btn-large" id="btn-end-season">
              🏆 Cerimonia Scudetto!
            </button>
          `}

          <div class="standings-sub-buttons">
            <button class="btn btn-secondary" id="btn-go-market">
              🔄 Mercato & Scambi
            </button>
            <button class="btn btn-secondary" id="btn-view-squads">
              🃏 Guarda le Rose
            </button>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderStandingsTable() {
    return `
      <div class="standings-table-wrapper animate-fade-in">
        <table class="standings-table">
          <thead>
            <tr>
              <th class="st-pos">#</th>
              <th class="st-team">Squadra</th>
              <th class="st-pts">Pt</th>
              <th class="st-played">G</th>
              <th class="st-won">V</th>
              <th class="st-drawn">P</th>
              <th class="st-lost">S</th>
              <th class="st-gf">GF</th>
              <th class="st-gs">GS</th>
              <th class="st-dr">DR</th>
              <th class="st-score">FantaPt</th>
              <th class="st-form">Forma</th>
            </tr>
          </thead>
          <tbody>
            ${sortedStandings.map((s, i) => {
              const manager = gameState.managers[s.managerId];
              const isFirst = i === 0;
              const isLast = i === sortedStandings.length - 1;
              return `
                <tr class="standings-row ${isFirst ? 'standings-first' : ''} ${isLast ? 'standings-last' : ''}"
                    style="--mgr-color: ${manager.color}">
                  <td class="st-pos">
                    ${isFirst ? '👑' : i + 1}
                  </td>
                  <td class="st-team">
                    <span class="team-color-dot" style="background: ${manager.color}"></span>
                    <strong>${manager.name}</strong>
                  </td>
                  <td class="st-pts"><strong>${s.points}</strong></td>
                  <td class="st-played">${s.played}</td>
                  <td class="st-won">${s.won}</td>
                  <td class="st-drawn">${s.drawn}</td>
                  <td class="st-lost">${s.lost}</td>
                  <td class="st-gf">${s.goalsFor || 0}</td>
                  <td class="st-gs">${s.goalsAgainst || 0}</td>
                  <td class="st-dr">${(s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff) || 0}</td>
                  <td class="st-score">${s.totalScore.toFixed(1)}</td>
                  <td class="st-form">
                    <div class="form-dots">
                      ${(s.form || []).map(f => `
                        <span class="form-dot form-${f}">${f === 'W' ? '🟢' : f === 'D' ? '🟡' : '🔴'}</span>
                      `).join('')}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderTopScorersTable() {
    return `
      <div class="topscorers-table-wrapper animate-fade-in">
        ${topScorers.length === 0 ? `
          <div class="no-scorers-yet">Nessun gol ancora segnato nel campionato!</div>
        ` : `
          <table class="topscorers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Calciatore</th>
                <th>Ruolo</th>
                <th>Squadra</th>
                <th>Gol</th>
                <th>Rig.</th>
              </tr>
            </thead>
            <tbody>
              ${topScorers.map((ts, i) => `
                <tr class="${i === 0 ? 'topscorer-lead' : ''}">
                  <td class="ts-rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                  <td class="ts-name">
                    <strong>${ts.name}</strong> ${ts.nation}
                  </td>
                  <td class="ts-role">${ROLE_EMOJI[ts.role]} ${ROLE_SHORT[ts.role]}</td>
                  <td class="ts-team">${ts.team}</td>
                  <td class="ts-goals"><strong>⚽ ${ts.goals}</strong></td>
                  <td class="ts-penalties">${ts.penalties > 0 ? `${ts.penalties}` : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  }

  function renderRoundResults() {
    if (!gameState.results || gameState.results.length === 0) return '';
    const currentResults = gameState.results.filter(r => r.round === gameState.currentRound);
    if (currentResults.length === 0) return '';

    return `
      <div class="standings-results">
        <h3>📋 Risultati Giornata ${currentRound}</h3>
        <div class="results-list">
          ${currentResults.map(r => {
            const home = gameState.managers[r.home];
            const away = gameState.managers[r.away];
            const homeWin = r.homeGoals > r.awayGoals;
            const awayWin = r.awayGoals > r.homeGoals;
            return `
              <div class="result-row-box">
                <div class="rrb-match">
                  <span class="rrb-team ${homeWin ? 'winner' : ''}" style="color: ${home.color}">${home.name}</span>
                  <span class="rrb-score">${r.homeGoals} - ${r.awayGoals}</span>
                  <span class="rrb-team ${awayWin ? 'winner' : ''}" style="color: ${away.color}">${away.name}</span>
                </div>
                <div class="rrb-details">
                  <span>(${r.homeScore.toFixed(1)} pt vs ${r.awayScore.toFixed(1)} pt)</span>
                </div>
                ${(r.homeGoalScorers?.length > 0 || r.awayGoalScorers?.length > 0) ? `
                  <div class="rrb-scorers">
                    <small>Marcatori: ${[
                      ...(r.homeGoalScorers || []).map(s => `${s.player} ${s.minute}'`),
                      ...(r.awayGoalScorers || []).map(s => `${s.player} ${s.minute}'`)
                    ].join(', ')}</small>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function bindEvents() {
    document.getElementById('tab-btn-standings')?.addEventListener('click', () => {
      activeTab = 'standings';
      renderUI();
    });

    document.getElementById('tab-btn-topscorers')?.addEventListener('click', () => {
      activeTab = 'topscorers';
      renderUI();
    });

    document.getElementById('btn-next-round')?.addEventListener('click', () => {
      gameState.currentRound++;
      // Resetta conferma formazioni per la nuova giornata
      gameState.managers.forEach(m => {
        m.formationConfirmed = false;
      });
      callbacks.saveGame();
      callbacks.navigate('formation');
    });

    document.getElementById('btn-end-season')?.addEventListener('click', () => {
      callbacks.navigate('end');
    });

    document.getElementById('btn-go-market')?.addEventListener('click', () => {
      callbacks.navigate('market');
    });

    document.getElementById('btn-view-squads')?.addEventListener('click', () => {
      callbacks.navigate('squad');
    });
  }

  renderUI();
}
