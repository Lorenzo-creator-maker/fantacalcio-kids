// FantaCalcio Kids — Gestione salvataggi in localStorage

const STORAGE_KEY = 'fantacalcio-kids-save';

/**
 * Salva lo stato del gioco
 */
export function saveGame(state) {
  try {
    const data = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, data);
    return true;
  } catch (e) {
    console.warn('Impossibile salvare la partita:', e);
    return false;
  }
}

/**
 * Carica lo stato del gioco salvato
 */
export function loadGame() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn('Impossibile caricare la partita:', e);
    return null;
  }
}

/**
 * Cancella il salvataggio
 */
export function clearGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Impossibile cancellare il salvataggio:', e);
  }
}

/**
 * Verifica se esiste un salvataggio
 */
export function hasSavedGame() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (e) {
    return false;
  }
}
