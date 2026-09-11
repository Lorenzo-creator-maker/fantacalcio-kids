// FantaCalcio Kids — Giornata di Campionato (Matchday) Ufficiale
// Regole: Fasce Gol (66+6), Marcatori con minuto, Modificatore Difesa, Sostituzioni panchina, Tabellino Pagelle

import { ROLE_EMOJI, ROLE_SHORT, getStars } from '../data/players.js';
import { 
  simulateTeamPerformance, 
  calculateMatchResult, 
  updateStandings, 
  getEventEmoji, 
  getEventText 
} from '../utils/scoring.js';

export function renderMatchday(container, gameState, callbacks) {
  const round = gameState.currentRound;
  const schedule = gameState.schedule;

  if (round >= schedule.length) {
    callbacks.navigate('end');
    return;
  }

  const matches = schedule[round];
  let currentMatchIdx = 0;
  let revealPhase = 'intro'; // 'intro' | 'revealing' | 'result'
  let revealIndex = 0;

  let homeTeamPerf = null;
  let awayTeamPerf = null;
  let matchResult = null;
  let showTabellino = false;

  function getCurrentMatch() {
    return matches[currentMatchIdx];
  }

  function renderMatchdayUI() {
    const match = getCurrentMatch();
    if (!match) return;

    container.innerHTML = `
      <div class="screen screen-matchday">
        <div class="matchday-header">
          <h1 class="screen-title">⚽ Giornata ${round + 1}</h1>
          <div class="matchday-round-info">
            ${matches.length > 1 ? `Partita ${currentMatchIdx + 1} di ${matches.length}` : 'Gara Ufficiale'}
          </div>
        </div>

        ${revealPhase === 'intro' ? renderIntro() : ''}
        ${revealPhase === 'revealing' ? renderRevealing() : ''}
        ${revealPhase === 'result' ? renderResult() : ''}
      </div>
    `;

    bindEvents();
  }

  function renderIntro() {
    const match = getCurrentMatch();
    const home = gameState.managers[match.home];
    const away = gameState.managers[match.away];

    return `
      <div class="matchday-intro animate-fade-in">
        <button class="btn-back" id="btn-back-formation">← Modifica Formazioni</button>

        <div class="matchday-versus">
          <div class="versus-team" style="--team-color: ${home.color}">
            <div class="versus-badge">${home.name.charAt(0)}</div>
            <div class="versus-name">${home.name}</div>
            <span class="versus-home-badge">🏟️ Casa</span>
          </div>
          <div class="versus-vs">VS</div>
          <div class="versus-team" style="--team-color: ${away.color}">
            <div class="versus-badge">${away.name.charAt(0)}</div>
            <div class="versus-name">${away.name}</div>
            <span class="versus-away-badge">✈️ Trasferta</span>
          </div>
        </div>

        <div class="matchday-rules-reminder">
          <span>Soglia Gol: <strong>66 pt</strong> (+6 pt a gol)</span>
          ${gameState.rules?.modifier !== false ? '<span>🛡️ Modif. Difesa Attivo</span>' : ''}
          ${gameState.rules?.homeAdvantage !== false ? '<span>🏟️ +2 pt Casa</span>' : ''}
        </div>

        <button class="btn btn-primary btn-glow btn-large matchday-start-btn" id="btn-start-match">
          🎴 Fischio d'Inizio e Apri Bustine!
        </button>
      </div>
    `;
  }

  function renderRevealing() {
    const match = getCurrentMatch();
    const home = gameState.managers[match.home];
    const away = gameState.managers[match.away];

    const homeActive = homeTeamPerf.activeLineup;
    const awayActive = awayTeamPerf.activeLineup;

    const homeSubCount = homeTeamPerf.substitutions.length;
    const awaySubCount = awayTeamPerf.substitutions.length;

    // Calcolo punteggi parziali fino alla carta rivelata
    const homePartial = homeActive.slice(0, revealIndex).reduce((s, p) => s + (p.isSV ? 0 : p.total), 0);
    const awayPartial = awayActive.slice(0, revealIndex).reduce((s, p) => s + (p.isSV ? 0 : p.total), 0);

    return `
      <div class="matchday-reveal">
        <!-- Tabellone Live Parziale -->
        <div class="matchday-scores">
          <div class="score-side" style="--team-color: ${home.color}">
            <div class="score-name">${home.name}</div>
            <div class="score-value ${homePartial > awayPartial ? 'score-leading' : ''}">${homePartial.toFixed(1)} pt</div>
          </div>
          <div class="score-divider">-</div>
          <div class="score-side" style="--team-color: ${away.color}">
            <div class="score-name">${away.name}</div>
            <div class="score-value ${awayPartial > homePartial ? 'score-leading' : ''}">${awayPartial.toFixed(1)} pt</div>
          </div>
        </div>

        <!-- Notifiche Sostituzioni avvenute -->
        ${(homeSubCount > 0 || awaySubCount > 0) ? `
          <div class="matchday-subs-bar animate-fade-in">
            ${homeTeamPerf.substitutions.map(s => `
              <div class="sub-alert-item" style="border-left: 3px solid ${home.color}">
                🔁 <strong>${home.name}</strong>: entra <em>${s.in.playerName}</em> per <em>${s.out.playerName} (S.V.)</em>
              </div>
            `).join('')}
            ${awayTeamPerf.substitutions.map(s => `
              <div class="sub-alert-item" style="border-left: 3px solid ${away.color}">
                🔁 <strong>${away.name}</strong>: entra <em>${s.in.playerName}</em> per <em>${s.out.playerName} (S.V.)</em>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Griglia Carte Rivelate -->
        <div class="matchday-cards-grid">
          <!-- Colonna Casa -->
          <div class="cards-column" style="--team-color: ${home.color}">
            <div class="column-team-tag">${home.name}</div>
            ${homeActive.map((perf, i) => {
              const revealed = i < revealIndex;
              return `
                <div class="reveal-card ${revealed ? 'revealed' : 'hidden-card'} ${i === revealIndex - 1 ? 'just-revealed' : ''}">
                  ${revealed ? `
                    <div class="mini-result-card ${perf.isSV ? 'card-sv' : ''}">
                      <span class="mini-role">${ROLE_EMOJI[perf.role]}</span>
                      <span class="mini-name">
                        ${perf.playerName}
                        ${perf.isCaptain ? ' ⭐️' : ''}
                        ${perf.isSubbedIn ? ' 🔁' : ''}
                      </span>
                      <span class="mini-vote">${perf.isSV ? 'S.V.' : perf.total.toFixed(1)}</span>
                      <span class="mini-events">
                        ${perf.events.map(e => getEventEmoji(e.type).repeat(e.count || 1)).join(' ')}
                      </span>
                    </div>
                  ` : `
                    <div class="mini-result-card mini-hidden">
                      <span class="mini-role">❓</span>
                    </div>
                  `}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Colonna Trasferta -->
          <div class="cards-column" style="--team-color: ${away.color}">
            <div class="column-team-tag">${away.name}</div>
            ${awayActive.map((perf, i) => {
              const revealed = i < revealIndex;
              return `
                <div class="reveal-card ${revealed ? 'revealed' : 'hidden-card'} ${i === revealIndex - 1 ? 'just-revealed' : ''}">
                  ${revealed ? `
                    <div class="mini-result-card ${perf.isSV ? 'card-sv' : ''}">
                      <span class="mini-role">${ROLE_EMOJI[perf.role]}</span>
                      <span class="mini-name">
                        ${perf.playerName}
                        ${perf.isCaptain ? ' ⭐️' : ''}
                        ${perf.isSubbedIn ? ' 🔁' : ''}
                      </span>
                      <span class="mini-vote">${perf.isSV ? 'S.V.' : perf.total.toFixed(1)}</span>
                      <span class="mini-events">
                        ${perf.events.map(e => getEventEmoji(e.type).repeat(e.count || 1)).join(' ')}
                      </span>
                    </div>
                  ` : `
                    <div class="mini-result-card mini-hidden">
                      <span class="mini-role">❓</span>
                    </div>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Pulsanti avanzamento reveal -->
        <div class="matchday-reveal-btn-area">
          ${revealIndex < 11 ? `
            <button class="btn btn-primary btn-glow" id="btn-reveal-next">
              🎴 Scopri carta ${revealIndex + 1}!
            </button>
          ` : `
            <button class="btn btn-primary btn-glow btn-large" id="btn-show-result">
              🏆 Calcola Risultato Finale in Gol!
            </button>
          `}
          <button class="btn btn-text" id="btn-reveal-all">
            Scopri tutte ⏩
          </button>
          <button class="btn btn-text btn-cancel-match" id="btn-cancel-match">
            ↩️ Annulla e Torna alla Formazione
          </button>
        </div>
      </div>
    `;
  }

  function renderResult() {
    const match = getCurrentMatch();
    const home = gameState.managers[match.home];
    const away = gameState.managers[match.away];

    const hGoals = matchResult.homeGoals;
    const aGoals = matchResult.awayGoals;
    const hScore = matchResult.homeScore;
    const aScore = matchResult.awayScore;

    const isDraw = matchResult.isDraw;
    const homeWin = matchResult.isHomeWin;
    const awayWin = matchResult.isAwayWin;

    return `
      <div class="matchday-result animate-bounce-in">
        <!-- Banner Risultato Calcistico Ufficiale -->
        <div class="result-banner ${isDraw ? 'result-draw' : ''}">
          ${isDraw ? '🤝 PAREGGIO!' : homeWin 
            ? `🎉 VITTORIA PER ${home.name}!` 
            : `🎉 VITTORIA PER ${away.name}!`}
        </div>

        <!-- Grande Tabellone Gol Calcio -->
        <div class="matchday-football-scoreboard">
          <div class="mf-team ${homeWin ? 'mf-winner' : ''}" style="--team-color: ${home.color}">
            <div class="mf-team-name">${home.name}</div>
            <div class="mf-goals">${hGoals}</div>
            <div class="mf-points">${hScore.toFixed(1)} pt</div>
          </div>

          <div class="mf-divider">:</div>

          <div class="mf-team ${awayWin ? 'mf-winner' : ''}" style="--team-color: ${away.color}">
            <div class="mf-team-name">${away.name}</div>
            <div class="mf-goals">${aGoals}</div>
            <div class="mf-points">${aScore.toFixed(1)} pt</div>
          </div>
        </div>

        <!-- Marcatori della Partita con Minuto -->
        <div class="matchday-scorers-box">
          <h3 class="scorers-title">⚽ Marcatori</h3>
          <div class="scorers-cols">
            <div class="scorers-col home-scorers">
              ${matchResult.homeGoalScorers.map(s => `
                <div class="scorer-tag">
                  ⚽ ${s.minute}' ${s.player} ${s.isPenalty ? '(Rig.)' : ''}
                </div>
              `).join('')}
              ${matchResult.homeGoalScorers.length === 0 ? '<div class="no-scorers">-</div>' : ''}
            </div>
            <div class="scorers-col away-scorers">
              ${matchResult.awayGoalScorers.map(s => `
                <div class="scorer-tag">
                  ⚽ ${s.minute}' ${s.player} ${s.isPenalty ? '(Rig.)' : ''}
                </div>
              `).join('')}
              ${matchResult.awayGoalScorers.length === 0 ? '<div class="no-scorers">-</div>' : ''}
            </div>
          </div>
        </div>

        <!-- Dettaglio Bonus di Squadra (Modificatore & Fattore Campo) -->
        <div class="matchday-team-bonuses">
          ${homeTeamPerf.defenseModifier.applied ? `
            <div class="bonus-pill">🛡️ Modificatore Difesa ${home.name}: +${homeTeamPerf.defenseModifier.bonus} pt (media ${homeTeamPerf.defenseModifier.avg})</div>
          ` : ''}
          ${awayTeamPerf.defenseModifier.applied ? `
            <div class="bonus-pill">🛡️ Modificatore Difesa ${away.name}: +${awayTeamPerf.defenseModifier.bonus} pt (media ${awayTeamPerf.defenseModifier.avg})</div>
          ` : ''}
          ${homeTeamPerf.homeBonus > 0 ? `
            <div class="bonus-pill">🏟️ Fattore Campo: +${homeTeamPerf.homeBonus} pt per ${home.name}</div>
          ` : ''}
        </div>

        <!-- Pulsante Tabellino / Pagelle -->
        <div class="matchday-tabellino-toggle">
          <button class="btn btn-outline" id="btn-toggle-tabellino">
            ${showTabellino ? '▲ Chiudi Pagelle' : '📋 Apri Tabellino & Pagelle Complete'}
          </button>
        </div>

        <!-- Tabellino Dettagliato Pagelle -->
        ${showTabellino ? renderTabellinoHTML() : ''}

        <!-- Pulsante Prossima Azione -->
        <div class="matchday-footer-btns">
          <button class="btn btn-primary btn-glow btn-large" id="btn-next-action">
            ${currentMatchIdx < matches.length - 1 ? 'Prossima Partita ⚽ →' : '🏆 Vai alla Classifica'}
          </button>
        </div>
      </div>

      ${homeWin || awayWin ? '<div class="confetti-container" id="confetti"></div>' : ''}
    `;
  }

  function renderTabellinoHTML() {
    const match = getCurrentMatch();
    const home = gameState.managers[match.home];
    const away = gameState.managers[match.away];

    function renderTeamRows(teamPerf) {
      return teamPerf.activeLineup.map(p => `
        <tr class="${p.isSV ? 'tabellino-sv' : ''}">
          <td class="tab-role">${ROLE_SHORT[p.role]}</td>
          <td class="tab-player">
            <strong>${p.playerName}</strong>
            ${p.isCaptain ? ' ⭐️(C)' : ''}
            ${p.isSubbedIn ? ` <small>(sub in per ${p.replacedPlayer})</small>` : ''}
          </td>
          <td class="tab-vote">${p.isSV ? 'S.V.' : p.vote.toFixed(1)}</td>
          <td class="tab-bonus">${p.bonus >= 0 ? `+${p.bonus.toFixed(1)}` : p.bonus.toFixed(1)}</td>
          <td class="tab-tot"><strong>${p.isSV ? '0.0' : p.total.toFixed(1)}</strong></td>
        </tr>
      `).join('');
    }

    return `
      <div class="matchday-tabellino animate-fade-in">
        <div class="tabellino-team-box">
          <h4 style="color: ${home.color}">📋 Pagelle ${home.name}</h4>
          <table class="tabellino-table">
            <thead>
              <tr><th>R</th><th>Calciatore</th><th>Voto</th><th>B/M</th><th>Tot</th></tr>
            </thead>
            <tbody>
              ${renderTeamRows(homeTeamPerf)}
            </tbody>
          </table>
        </div>

        <div class="tabellino-team-box">
          <h4 style="color: ${away.color}">📋 Pagelle ${away.name}</h4>
          <table class="tabellino-table">
            <thead>
              <tr><th>R</th><th>Calciatore</th><th>Voto</th><th>B/M</th><th>Tot</th></tr>
            </thead>
            <tbody>
              ${renderTeamRows(awayTeamPerf)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    // Torna alla formazione dalla schermata intro
    document.getElementById('btn-back-formation')?.addEventListener('click', () => {
      gameState.managers.forEach(m => {
        m.formationConfirmed = false;
      });
      callbacks.saveGame();
      callbacks.navigate('formation');
    });

    // Annulla match durante la rivelazione e torna alla formazione
    document.getElementById('btn-cancel-match')?.addEventListener('click', () => {
      const ok = confirm("Vuoi annullare la partita in corso e tornare a modificare le formazioni?");
      if (!ok) return;
      revealPhase = 'intro';
      revealIndex = 0;
      homeTeamPerf = null;
      awayTeamPerf = null;
      matchResult = null;
      gameState.managers.forEach(m => {
        m.formationConfirmed = false;
      });
      callbacks.saveGame();
      callbacks.navigate('formation');
    });

    document.getElementById('btn-start-match')?.addEventListener('click', () => {
      startMatch();
    });

    document.getElementById('btn-reveal-next')?.addEventListener('click', () => {
      revealIndex++;
      renderMatchdayUI();
    });

    document.getElementById('btn-reveal-all')?.addEventListener('click', () => {
      revealIndex = 11;
      renderMatchdayUI();
    });

    document.getElementById('btn-show-result')?.addEventListener('click', () => {
      finishMatch();
    });

    document.getElementById('btn-toggle-tabellino')?.addEventListener('click', () => {
      showTabellino = !showTabellino;
      renderMatchdayUI();
    });

    document.getElementById('btn-next-action')?.addEventListener('click', () => {
      if (currentMatchIdx < matches.length - 1) {
        currentMatchIdx++;
        revealPhase = 'intro';
        revealIndex = 0;
        homeTeamPerf = null;
        awayTeamPerf = null;
        matchResult = null;
        showTabellino = false;
        renderMatchdayUI();
      } else {
        callbacks.navigate('standings');
      }
    });

    if (document.getElementById('confetti')) {
      createConfetti();
    }
  }

  function startMatch() {
    const match = getCurrentMatch();
    if (!match) return;

    const homeMgr = gameState.managers[match.home];
    const awayMgr = gameState.managers[match.away];

    // Simula prestazione squadra di casa con panchina, capitano e fattore campo
    homeTeamPerf = simulateTeamPerformance({
      starters: homeMgr.formation || homeMgr.squad.slice(0, 11),
      bench: homeMgr.bench || homeMgr.squad.slice(11),
      captainId: homeMgr.captainId,
      isHome: true,
      rules: gameState.rules || {},
      allPlayers: gameState.allPlayers,
    });

    // Simula prestazione squadra in trasferta
    awayTeamPerf = simulateTeamPerformance({
      starters: awayMgr.formation || awayMgr.squad.slice(0, 11),
      bench: awayMgr.bench || awayMgr.squad.slice(11),
      captainId: awayMgr.captainId,
      isHome: false,
      rules: gameState.rules || {},
      allPlayers: gameState.allPlayers,
    });

    revealPhase = 'revealing';
    revealIndex = 0;
    renderMatchdayUI();
  }

  function finishMatch() {
    const match = getCurrentMatch();
    if (!match) return;

    const homeMgr = gameState.managers[match.home];
    const awayMgr = gameState.managers[match.away];

    // Calcola risultato in gol secondo le fasce e regole di scarto
    matchResult = calculateMatchResult(homeTeamPerf, awayTeamPerf, homeMgr.name, awayMgr.name);

    // Aggiorna classifica ufficiale con GF, GS, DR e Punti
    updateStandings(
      gameState.standings, 
      match.home, 
      match.away, 
      matchResult.homeGoals, 
      matchResult.awayGoals, 
      matchResult.homeScore, 
      matchResult.awayScore
    );

    // Salva risultato per storico e classifica marcatori
    if (!gameState.results) gameState.results = [];
    gameState.results.push({
      round: round,
      home: match.home,
      away: match.away,
      homeGoals: matchResult.homeGoals,
      awayGoals: matchResult.awayGoals,
      homeScore: matchResult.homeScore,
      awayScore: matchResult.awayScore,
      homeGoalScorers: matchResult.homeGoalScorers,
      awayGoalScorers: matchResult.awayGoalScorers,
      homePerformances: homeTeamPerf.activeLineup,
      awayPerformances: awayTeamPerf.activeLineup,
    });

    revealPhase = 'result';
    callbacks.saveGame();
    renderMatchdayUI();
  }

  function createConfetti() {
    const container = document.getElementById('confetti');
    if (!container) return;

    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF9FF3'];
    const emojis = ['🎉', '⭐', '🏆', '⚽', '✨'];

    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const isEmoji = Math.random() < 0.3;
      
      if (isEmoji) {
        piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        piece.style.fontSize = `${Math.random() * 16 + 12}px`;
      } else {
        piece.style.width = `${Math.random() * 10 + 5}px`;
        piece.style.height = `${Math.random() * 10 + 5}px`;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      }
      
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * 2}s`;
      piece.style.animationDuration = `${Math.random() * 2 + 2}s`;
      container.appendChild(piece);
    }

    setTimeout(() => {
      if (container) container.innerHTML = '';
    }, 4000);
  }

  renderMatchdayUI();
}
