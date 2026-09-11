// FantaCalcio Kids — Schermata Home

import { hasSavedGame } from '../utils/storage.js';

/**
 * Renderizza la schermata iniziale con logo, carte fluttuanti e pulsanti
 */
export function renderHome(container, gameState, callbacks) {
  const hasSave = hasSavedGame();

  container.innerHTML = `
    <div class="screen screen-home">
      <!-- Carte decorative fluttuanti -->
      <div class="floating-cards" aria-hidden="true">
        <div class="floating-card fc-1">🧤</div>
        <div class="floating-card fc-2">🛡️</div>
        <div class="floating-card fc-3">🎯</div>
        <div class="floating-card fc-4">⚡</div>
        <div class="floating-card fc-5">⚽</div>
        <div class="floating-card fc-6">🏆</div>
      </div>

      <div class="home-content">
        <div class="home-logo">
          <div class="home-logo-icon">⚽</div>
          <h1 class="home-title">
            <span class="home-title-fanta">Fanta</span><span class="home-title-calcio">Calcio</span>
          </h1>
          <div class="home-subtitle">KIDS ⭐</div>
        </div>

        <div class="home-tagline">Il fantacalcio dei campioni!</div>

        <div class="home-buttons">
          <button class="btn btn-primary btn-glow" id="btn-new-game">
            🎴 Nuova Partita
          </button>
          ${hasSave ? `
            <button class="btn btn-secondary" id="btn-continue">
              ▶️ Continua Partita
            </button>
          ` : ''}
        </div>

        <div class="home-footer">
          <div class="home-cards-preview">
            <span class="preview-card pc-gold">🧤</span>
            <span class="preview-card pc-blue">🛡️</span>
            <span class="preview-card pc-green">🎯</span>
            <span class="preview-card pc-red">⚡</span>
          </div>
          <p class="home-footer-text">Colleziona i migliori calciatori del mondo!</p>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('btn-new-game')?.addEventListener('click', () => {
    callbacks.navigate('setup');
  });

  document.getElementById('btn-continue')?.addEventListener('click', () => {
    callbacks.continueGame();
  });
}
