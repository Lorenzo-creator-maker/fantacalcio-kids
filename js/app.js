// FantaCalcio Kids — App principale e Router Ufficiale

import { PLAYERS } from './data/players.js';
import { saveGame, loadGame, clearGame } from './utils/storage.js';
import { generateSchedule, createStandings, calculateTopScorers } from './utils/scoring.js';
import { renderHome } from './screens/home.js';
import { renderSetup } from './screens/setup.js';
import { renderAuction } from './screens/auction.js';
import { renderFormation } from './screens/formation.js';
import { renderMatchday } from './screens/matchday.js';
import { renderStandings } from './screens/standings.js';
import { renderSquad } from './screens/squad.js';
import { renderMarket } from './screens/market.js';

// ═══════════════════════════════════════
// Stato del gioco
// ═══════════════════════════════════════
let gameState = {
  phase: 'home',
  previousPhase: null,
  managers: [],
  rules: {
    initialBudget: 100,
    modifier: true,
    homeAdvantage: true,
    captainBonus: true,
    benchSubstitutions: true,
  },
  allPlayers: [...PLAYERS],
  auctionRole: 'P',
  auctionDecks: null,
  auctionRoleIndices: null,
  auctionHistory: [],
  marketHistory: [],
  schedule: [],
  currentRound: 0,
  standings: [],
  results: [],
};

// ═══════════════════════════════════════
// Container principale
// ═══════════════════════════════════════
const app = document.getElementById('app');

// ═══════════════════════════════════════
// Callbacks condivisi tra le schermate
// ═══════════════════════════════════════
const callbacks = {
  navigate: (screen) => {
    gameState.previousPhase = gameState.phase;
    gameState.phase = screen;
    doSaveGame();
    renderScreen(screen);
  },

  saveGame: () => {
    doSaveGame();
  },

  startGame: (managers, rules = {}) => {
    // Inizializza una nuova partita con le regole ufficiali
    gameState = {
      phase: 'auction',
      previousPhase: 'setup',
      managers: managers,
      rules: {
        initialBudget: 100,
        modifier: true,
        homeAdvantage: true,
        captainBonus: true,
        benchSubstitutions: true,
        ...rules,
      },
      allPlayers: [...PLAYERS],
      auctionRole: 'P',
      auctionDecks: null,
      auctionRoleIndices: null,
      auctionHistory: [],
      marketHistory: [],
      schedule: [],
      currentRound: 0,
      standings: [],
      results: [],
    };
    doSaveGame();
    renderScreen('auction');
  },

  continueGame: () => {
    const saved = loadGame();
    if (saved) {
      gameState = saved;
      gameState.allPlayers = [...PLAYERS];
      gameState.auctionHistory = gameState.auctionHistory || [];
      gameState.marketHistory = gameState.marketHistory || [];
      renderScreen(gameState.phase);
    }
  },
};

// ═══════════════════════════════════════
// Router
// ═══════════════════════════════════════
function renderScreen(screen) {
  app.innerHTML = '';
  app.className = `app-container phase-${screen}`;

  window.scrollTo(0, 0);

  switch (screen) {
    case 'home':
      renderHome(app, gameState, callbacks);
      break;

    case 'setup':
      renderSetup(app, gameState, callbacks);
      break;

    case 'auction':
      renderAuction(app, gameState, callbacks);
      break;

    case 'formation':
      if (gameState.schedule.length === 0) {
        gameState.schedule = generateSchedule(gameState.managers.length);
        gameState.standings = createStandings(gameState.managers.length);
        gameState.currentRound = 0;
        gameState.results = [];
      }
      renderFormation(app, gameState, callbacks);
      break;

    case 'matchday':
      renderMatchday(app, gameState, callbacks);
      break;

    case 'standings':
      renderStandings(app, gameState, callbacks);
      break;

    case 'squad':
      renderSquad(app, gameState, callbacks);
      break;

    case 'market':
      renderMarket(app, gameState, callbacks);
      break;

    case 'end':
      renderEnd(app, gameState, callbacks);
      break;

    default:
      renderHome(app, gameState, callbacks);
  }
}

// ═══════════════════════════════════════
// Schermata Fine Campionato con Premiazione Ufficiale
// ═══════════════════════════════════════
function renderEnd(container, gs, cb) {
  const sortedStandings = [...gs.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.totalScore - a.totalScore;
  });

  const winnerId = sortedStandings[0]?.managerId;
  const winner = gs.managers[winnerId];
  const isDraw = sortedStandings.length > 1 && sortedStandings[0].points === sortedStandings[1].points && sortedStandings[0].goalDiff === sortedStandings[1].goalDiff;

  // Statistiche speciali del torneo:
  // 1. Miglior Attacco
  const bestAttackMgr = [...sortedStandings].sort((a, b) => (b.goalsFor || 0) - (a.goalsFor || 0))[0];
  // 2. Miglior Difesa
  const bestDefenseMgr = [...sortedStandings].sort((a, b) => (a.goalsAgainst || 0) - (b.goalsAgainst || 0))[0];
  // 3. Capocannoniere
  const topScorers = calculateTopScorers(gs.results || [], gs.allPlayers);
  const capocannoniere = topScorers[0] || null;

  container.innerHTML = `
    <div class="screen screen-end">
      <div class="end-confetti-bg" id="end-confetti"></div>

      <div class="end-content">
        <div class="end-trophy animate-bounce-in">🏆</div>
        
        <h1 class="end-title animate-fade-in">
          ${isDraw ? 'Grande Sfida al Vertice!' : 'CAMPIONE D\'ITALIA!'}
        </h1>
        
        <div class="end-winner animate-fade-in" style="--mgr-color: ${winner?.color || '#FFD700'}">
          <div class="end-winner-name">${winner?.name || 'Nessuno'}</div>
          <div class="end-winner-points">${sortedStandings[0]?.points || 0} Punti (${sortedStandings[0]?.goalsFor || 0} Gol)</div>
        </div>

        <!-- Premi Speciali del Torneo -->
        <div class="end-special-awards animate-fade-in">
          <div class="award-card">
            <span class="award-icon">⚽</span>
            <span class="award-title">Miglior Attacco</span>
            <span class="award-name">${gs.managers[bestAttackMgr?.managerId]?.name} (${bestAttackMgr?.goalsFor || 0} gol)</span>
          </div>

          <div class="award-card">
            <span class="award-icon">🛡️</span>
            <span class="award-title">Miglior Difesa</span>
            <span class="award-name">${gs.managers[bestDefenseMgr?.managerId]?.name} (${bestDefenseMgr?.goalsAgainst || 0} subiti)</span>
          </div>

          ${capocannoniere ? `
            <div class="award-card">
              <span class="award-icon">🥇</span>
              <span class="award-title">Capocannoniere</span>
              <span class="award-name">${capocannoniere.name} (⚽ ${capocannoniere.goals})</span>
            </div>
          ` : ''}
        </div>

        <!-- Classifica Finale Completa -->
        <div class="end-final-standings">
          <h3>🏅 Classifica Finale</h3>
          ${sortedStandings.map((s, i) => {
            const m = gs.managers[s.managerId];
            const medals = ['🥇', '🥈', '🥉', '4️⃣'];
            return `
              <div class="end-standing-row" style="--mgr-color: ${m.color}">
                <span class="end-medal">${medals[i] || ''}</span>
                <span class="end-name"><strong>${m.name}</strong></span>
                <span class="end-details">${s.won}V ${s.drawn}P ${s.lost}S (${s.goalsFor || 0}:${s.goalsAgainst || 0})</span>
                <span class="end-pts">${s.points} pt</span>
              </div>
            `;
          }).join('')}
        </div>

        <div class="end-buttons">
          <button class="btn btn-primary btn-glow btn-large" id="btn-new-game">
            🎴 Nuova Partita
          </button>
          <button class="btn btn-secondary" id="btn-view-squads-end">
            🃏 Rivedi le Rose
          </button>
        </div>
      </div>
    </div>
  `;

  createEndConfetti();

  document.getElementById('btn-new-game')?.addEventListener('click', () => {
    clearGame();
    gameState = {
      phase: 'home',
      managers: [],
      rules: {
        initialBudget: 100,
        modifier: true,
        homeAdvantage: true,
        captainBonus: true,
        benchSubstitutions: true,
      },
      allPlayers: [...PLAYERS],
      auctionRole: 'P',
      auctionDecks: null,
      auctionRoleIndices: null,
      schedule: [],
      currentRound: 0,
      standings: [],
      results: [],
    };
    renderScreen('home');
  });

  document.getElementById('btn-view-squads-end')?.addEventListener('click', () => {
    cb.navigate('squad');
  });
}

function createEndConfetti() {
  const container = document.getElementById('end-confetti');
  if (!container) return;

  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF9FF3', '#FFEAA7'];
  const emojis = ['🎉', '⭐', '🏆', '⚽', '✨', '🎊', '🥇'];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const isEmoji = Math.random() < 0.3;

    if (isEmoji) {
      piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      piece.style.fontSize = `${Math.random() * 20 + 14}px`;
    } else {
      piece.style.width = `${Math.random() * 12 + 5}px`;
      piece.style.height = `${Math.random() * 12 + 5}px`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    }

    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 3}s`;
    piece.style.animationDuration = `${Math.random() * 3 + 2}s`;
    container.appendChild(piece);
  }
}

// ═══════════════════════════════════════
// Salvataggio
// ═══════════════════════════════════════
function doSaveGame() {
  const stateToSave = { ...gameState };
  delete stateToSave.allPlayers;
  saveGame(stateToSave);
}

// ═══════════════════════════════════════
// Avvio
// ═══════════════════════════════════════
renderScreen('home');
