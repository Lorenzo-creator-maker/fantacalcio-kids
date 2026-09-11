// FantaCalcio Kids — Database Calciatori Ufficiale
// 96 campioni mondiali e di Serie A bilanciati per ruoli (12 P, 28 D, 28 C, 28 A)

export const PLAYERS = [
  // ═══════════════════════════════════════
  // PORTIERI (12)
  // ═══════════════════════════════════════
  { id: 1,  name: 'Donnarumma',   team: 'Paris Saint-Germain', nation: '🇮🇹', role: 'P', rating: 89, basePrice: 7 },
  { id: 2,  name: 'Courtois',     team: 'Real Madrid',         nation: '🇧🇪', role: 'P', rating: 89, basePrice: 7 },
  { id: 3,  name: 'Alisson',      team: 'Liverpool',           nation: '🇧🇷', role: 'P', rating: 89, basePrice: 7 },
  { id: 4,  name: 'Ter Stegen',   team: 'Barcelona',           nation: '🇩🇪', role: 'P', rating: 88, basePrice: 6 },
  { id: 5,  name: 'Maignan',      team: 'AC Milan',            nation: '🇫🇷', role: 'P', rating: 87, basePrice: 5 },
  { id: 6,  name: 'E. Martínez',  team: 'Aston Villa',         nation: '🇦🇷', role: 'P', rating: 88, basePrice: 6 },
  { id: 7,  name: 'Oblak',        team: 'Atletico Madrid',     nation: '🇸🇮', role: 'P', rating: 87, basePrice: 5 },
  { id: 8,  name: 'Sommer',       team: 'Inter',               nation: '🇨🇭', role: 'P', rating: 86, basePrice: 5 },
  { id: 9,  name: 'Ederson',      team: 'Manchester City',     nation: '🇧🇷', role: 'P', rating: 88, basePrice: 6 },
  { id: 10, name: 'Neuer',        team: 'Bayern Monaco',       nation: '🇩🇪', role: 'P', rating: 85, basePrice: 4 },
  { id: 11, name: 'Di Gregorio',  team: 'Juventus',            nation: '🇮🇹', role: 'P', rating: 84, basePrice: 3 },
  { id: 12, name: 'Meret',        team: 'Napoli',              nation: '🇮🇹', role: 'P', rating: 83, basePrice: 3 },

  // ═══════════════════════════════════════
  // DIFENSORI (28)
  // ═══════════════════════════════════════
  { id: 13, name: 'Van Dijk',           team: 'Liverpool',           nation: '🇳🇱', role: 'D', rating: 90, basePrice: 9 },
  { id: 14, name: 'Rúben Dias',         team: 'Manchester City',     nation: '🇵🇹', role: 'D', rating: 88, basePrice: 7 },
  { id: 15, name: 'Bastoni',            team: 'Inter',               nation: '🇮🇹', role: 'D', rating: 88, basePrice: 7 },
  { id: 16, name: 'Saliba',             team: 'Arsenal',             nation: '🇫🇷', role: 'D', rating: 87, basePrice: 6 },
  { id: 17, name: 'Bremer',             team: 'Juventus',            nation: '🇧🇷', role: 'D', rating: 87, basePrice: 6 },
  { id: 18, name: 'Alexander-Arnold',   team: 'Liverpool',           nation: '🇬🇧', role: 'D', rating: 87, basePrice: 6 },
  { id: 19, name: 'Hakimi',             team: 'Paris Saint-Germain', nation: '🇲🇦', role: 'D', rating: 87, basePrice: 6 },
  { id: 20, name: 'Theo Hernandez',     team: 'AC Milan',            nation: '🇫🇷', role: 'D', rating: 87, basePrice: 6 },
  { id: 21, name: 'Dimarco',            team: 'Inter',               nation: '🇮🇹', role: 'D', rating: 86, basePrice: 5 },
  { id: 22, name: 'Araújo',             team: 'Barcelona',           nation: '🇺🇾', role: 'D', rating: 86, basePrice: 5 },
  { id: 23, name: 'Koundé',             team: 'Barcelona',           nation: '🇫🇷', role: 'D', rating: 86, basePrice: 5 },
  { id: 24, name: 'Gvardiol',           team: 'Manchester City',     nation: '🇭🇷', role: 'D', rating: 86, basePrice: 5 },
  { id: 25, name: 'Calafiori',          team: 'Arsenal',             nation: '🇮🇹', role: 'D', rating: 85, basePrice: 4 },
  { id: 26, name: 'Buongiorno',         team: 'Napoli',              nation: '🇮🇹', role: 'D', rating: 85, basePrice: 4 },
  { id: 27, name: 'Gabriel',            team: 'Arsenal',             nation: '🇧🇷', role: 'D', rating: 85, basePrice: 4 },
  { id: 28, name: 'Kim Min-jae',        team: 'Bayern Monaco',       nation: '🇰🇷', role: 'D', rating: 85, basePrice: 4 },
  { id: 29, name: 'Marquinhos',         team: 'Paris Saint-Germain', nation: '🇧🇷', role: 'D', rating: 85, basePrice: 4 },
  { id: 30, name: 'Davies',             team: 'Bayern Monaco',       nation: '🇨🇦', role: 'D', rating: 85, basePrice: 4 },
  { id: 31, name: 'Pavard',             team: 'Inter',               nation: '🇫🇷', role: 'D', rating: 84, basePrice: 3 },
  { id: 32, name: 'Militão',            team: 'Real Madrid',         nation: '🇧🇷', role: 'D', rating: 84, basePrice: 3 },
  { id: 33, name: 'Konaté',             team: 'Liverpool',           nation: '🇫🇷', role: 'D', rating: 84, basePrice: 3 },
  { id: 34, name: 'Di Lorenzo',         team: 'Napoli',              nation: '🇮🇹', role: 'D', rating: 83, basePrice: 3 },
  { id: 35, name: 'Cancelo',            team: 'Al-Hilal',            nation: '🇵🇹', role: 'D', rating: 83, basePrice: 2 },
  { id: 36, name: 'Acerbi',             team: 'Inter',               nation: '🇮🇹', role: 'D', rating: 83, basePrice: 2 },
  { id: 37, name: 'Tomori',             team: 'AC Milan',            nation: '🇬🇧', role: 'D', rating: 83, basePrice: 2 },
  { id: 38, name: 'Upamecano',          team: 'Bayern Monaco',       nation: '🇫🇷', role: 'D', rating: 83, basePrice: 2 },
  { id: 39, name: 'Mancini',            team: 'Roma',                nation: '🇮🇹', role: 'D', rating: 82, basePrice: 2 },
  { id: 40, name: 'Bellanova',          team: 'Atalanta',            nation: '🇮🇹', role: 'D', rating: 82, basePrice: 2 },

  // ═══════════════════════════════════════
  // CENTROCAMPISTI (28)
  // ═══════════════════════════════════════
  { id: 41, name: 'Rodri',            team: 'Manchester City',     nation: '🇪🇸', role: 'C', rating: 91, basePrice: 10 },
  { id: 42, name: 'Bellingham',       team: 'Real Madrid',         nation: '🇬🇧', role: 'C', rating: 90, basePrice: 9 },
  { id: 43, name: 'De Bruyne',        team: 'Manchester City',     nation: '🇧🇪', role: 'C', rating: 89, basePrice: 8 },
  { id: 44, name: 'Barella',          team: 'Inter',               nation: '🇮🇹', role: 'C', rating: 88, basePrice: 7 },
  { id: 45, name: 'Wirtz',            team: 'Bayer Leverkusen',    nation: '🇩🇪', role: 'C', rating: 88, basePrice: 7 },
  { id: 46, name: 'Musiala',          team: 'Bayern Monaco',       nation: '🇩🇪', role: 'C', rating: 88, basePrice: 7 },
  { id: 47, name: 'Palmer',           team: 'Chelsea',             nation: '🇬🇧', role: 'C', rating: 88, basePrice: 7 },
  { id: 48, name: 'Saka',             team: 'Arsenal',             nation: '🇬🇧', role: 'C', rating: 88, basePrice: 7 },
  { id: 49, name: 'Foden',            team: 'Manchester City',     nation: '🇬🇧', role: 'C', rating: 88, basePrice: 7 },
  { id: 50, name: 'Çalhanoğlu',       team: 'Inter',               nation: '🇹🇷', role: 'C', rating: 87, basePrice: 6 },
  { id: 51, name: 'Valverde',         team: 'Real Madrid',         nation: '🇺🇾', role: 'C', rating: 88, basePrice: 7 },
  { id: 52, name: 'Pedri',            team: 'Barcelona',           nation: '🇪🇸', role: 'C', rating: 87, basePrice: 6 },
  { id: 53, name: 'Bernardo Silva',   team: 'Manchester City',     nation: '🇵🇹', role: 'C', rating: 87, basePrice: 6 },
  { id: 54, name: 'Bruno Fernandes',  team: 'Manchester United',   nation: '🇵🇹', role: 'C', rating: 86, basePrice: 5 },
  { id: 55, name: 'Pulisic',          team: 'AC Milan',            nation: '🇺🇸', role: 'C', rating: 86, basePrice: 5 },
  { id: 56, name: 'Lookman',          team: 'Atalanta',            nation: '🇳🇬', role: 'C', rating: 86, basePrice: 5 },
  { id: 57, name: 'Koopmeiners',      team: 'Juventus',            nation: '🇳🇱', role: 'C', rating: 86, basePrice: 5 },
  { id: 58, name: 'McTominay',        team: 'Napoli',              nation: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', role: 'C', rating: 85, basePrice: 4 },
  { id: 59, name: 'Reijnders',        team: 'AC Milan',            nation: '🇳🇱', role: 'C', rating: 85, basePrice: 4 },
  { id: 60, name: 'Tonali',           team: 'Newcastle',           nation: '🇮🇹', role: 'C', rating: 85, basePrice: 4 },
  { id: 61, name: 'Dybala',           team: 'Roma',                nation: '🇦🇷', role: 'C', rating: 85, basePrice: 4 },
  { id: 62, name: 'Modrić',           team: 'Real Madrid',         nation: '🇭🇷', role: 'C', rating: 84, basePrice: 3 },
  { id: 63, name: 'Camavinga',        team: 'Real Madrid',         nation: '🇫🇷', role: 'C', rating: 84, basePrice: 3 },
  { id: 64, name: 'Tchouaméni',       team: 'Real Madrid',         nation: '🇫🇷', role: 'C', rating: 84, basePrice: 3 },
  { id: 65, name: 'Szoboszlai',       team: 'Liverpool',           nation: '🇭🇺', role: 'C', rating: 84, basePrice: 3 },
  { id: 66, name: 'Ederson',          team: 'Atalanta',            nation: '🇧🇷', role: 'C', rating: 84, basePrice: 3 },
  { id: 67, name: 'Zaccagni',         team: 'Lazio',               nation: '🇮🇹', role: 'C', rating: 83, basePrice: 2 },
  { id: 68, name: 'Pellegrini',       team: 'Roma',                nation: '🇮🇹', role: 'C', rating: 83, basePrice: 2 },

  // ═══════════════════════════════════════
  // ATTACCANTI (28)
  // ═══════════════════════════════════════
  { id: 69, name: 'Haaland',          team: 'Manchester City',     nation: '🇳🇴', role: 'A', rating: 92, basePrice: 10 },
  { id: 70, name: 'Mbappé',           team: 'Real Madrid',         nation: '🇫🇷', role: 'A', rating: 91, basePrice: 9 },
  { id: 71, name: 'Vinícius Jr',      team: 'Real Madrid',         nation: '🇧🇷', role: 'A', rating: 91, basePrice: 9 },
  { id: 72, name: 'Salah',            team: 'Liverpool',           nation: '🇪🇬', role: 'A', rating: 89, basePrice: 8 },
  { id: 73, name: 'Kane',             team: 'Bayern Monaco',       nation: '🇬🇧', role: 'A', rating: 89, basePrice: 8 },
  { id: 74, name: 'Lautaro Martínez', team: 'Inter',               nation: '🇦🇷', role: 'A', rating: 89, basePrice: 8 },
  { id: 75, name: 'Lewandowski',      team: 'Barcelona',           nation: '🇵🇱', role: 'A', rating: 88, basePrice: 7 },
  { id: 76, name: 'Lamine Yamal',     team: 'Barcelona',           nation: '🇪🇸', role: 'A', rating: 88, basePrice: 7 },
  { id: 77, name: 'Leão',             team: 'AC Milan',            nation: '🇵🇹', role: 'A', rating: 87, basePrice: 6 },
  { id: 78, name: 'Osimhen',          team: 'Galatasaray',         nation: '🇳🇬', role: 'A', rating: 87, basePrice: 6 },
  { id: 79, name: 'Son',              team: 'Tottenham',           nation: '🇰🇷', role: 'A', rating: 87, basePrice: 6 },
  { id: 80, name: 'Vlahović',         team: 'Juventus',            nation: '🇷🇸', role: 'A', rating: 86, basePrice: 5 },
  { id: 81, name: 'Kvaratskhelia',    team: 'Napoli',              nation: '🇬🇪', role: 'A', rating: 86, basePrice: 5 },
  { id: 82, name: 'M. Thuram',        team: 'Inter',               nation: '🇫🇷', role: 'A', rating: 86, basePrice: 5 },
  { id: 83, name: 'J. Álvarez',       team: 'Atletico Madrid',     nation: '🇦🇷', role: 'A', rating: 86, basePrice: 5 },
  { id: 84, name: 'Retegui',          team: 'Atalanta',            nation: '🇮🇹', role: 'A', rating: 85, basePrice: 4 },
  { id: 85, name: 'Lukaku',           team: 'Napoli',              nation: '🇧🇪', role: 'A', rating: 85, basePrice: 4 },
  { id: 86, name: 'Dembélé',          team: 'Paris Saint-Germain', nation: '🇫🇷', role: 'A', rating: 85, basePrice: 4 },
  { id: 87, name: 'Díaz',             team: 'Liverpool',           nation: '🇨🇴', role: 'A', rating: 85, basePrice: 4 },
  { id: 88, name: 'Messi',            team: 'Inter Miami',         nation: '🇦🇷', role: 'A', rating: 86, basePrice: 5 },
  { id: 89, name: 'Morata',           team: 'AC Milan',            nation: '🇪🇸', role: 'A', rating: 84, basePrice: 3 },
  { id: 90, name: 'Núñez',            team: 'Liverpool',           nation: '🇺🇾', role: 'A', rating: 84, basePrice: 3 },
  { id: 91, name: 'Dovbyk',           team: 'Roma',                nation: '🇺🇦', role: 'A', rating: 84, basePrice: 3 },
  { id: 92, name: 'Neymar',           team: 'Al-Hilal',            nation: '🇧🇷', role: 'A', rating: 84, basePrice: 3 },
  { id: 93, name: 'Kean',             team: 'Fiorentina',          nation: '🇮🇹', role: 'A', rating: 83, basePrice: 3 },
  { id: 94, name: 'Castellanos',      team: 'Lazio',               nation: '🇦🇷', role: 'A', rating: 83, basePrice: 3 },
  { id: 95, name: 'Yildiz',           team: 'Juventus',            nation: '🇹🇷', role: 'A', rating: 83, basePrice: 3 },
  { id: 96, name: 'Raspadori',        team: 'Napoli',              nation: '🇮🇹', role: 'A', rating: 82, basePrice: 2 },
];

// Etichette ruoli in italiano
export const ROLE_LABELS = {
  P: 'Portiere',
  D: 'Difensore',
  C: 'Centrocampista',
  A: 'Attaccante',
};

// Abbreviazioni ruoli
export const ROLE_SHORT = {
  P: 'POR',
  D: 'DIF',
  C: 'CEN',
  A: 'ATT',
};

// Emoji per ruolo
export const ROLE_EMOJI = {
  P: '🧤',
  D: '🛡️',
  C: '🎯',
  A: '⚡',
};

// Colori gradient per ruolo (carte figurine)
export const ROLE_COLORS = {
  P: { from: '#FFD700', to: '#FFA500', text: '#5D4200' },
  D: { from: '#42A5F5', to: '#1565C0', text: '#ffffff' },
  C: { from: '#66BB6A', to: '#2E7D32', text: '#ffffff' },
  A: { from: '#EF5350', to: '#C62828', text: '#ffffff' },
};

// Colori squadre disponibili per i manager
export const TEAM_COLORS = [
  { name: 'Rosso',     value: '#E63946', light: '#FF8A93' },
  { name: 'Blu',       value: '#457B9D', light: '#8CB8D0' },
  { name: 'Verde',     value: '#2A9D8F', light: '#7DD3C8' },
  { name: 'Arancione', value: '#F4A261', light: '#FFD0A0' },
  { name: 'Viola',     value: '#7B2D8E', light: '#C87DDA' },
  { name: 'Oro',       value: '#D4A017', light: '#F0D060' },
];

/**
 * Converte il rating in stelline (1-5)
 */
export function getStars(rating) {
  if (rating >= 90) return 5;
  if (rating >= 86) return 4;
  if (rating >= 82) return 3;
  if (rating >= 78) return 2;
  return 1;
}

/**
 * Crea l'HTML di una carta calciatore stile Panini
 */
export function createCardHTML(player, options = {}) {
  const { 
    showPrice = false, 
    flipped = false, 
    small = false, 
    selected = false, 
    showVote = false, 
    vote = null, 
    events = [],
    isCaptain = false,
    isBench = false,
    isSubbedIn = false,
    badgeText = null
  } = options;

  const stars = getStars(player.rating);
  const starsHTML = '⭐'.repeat(stars);
  const roleColor = ROLE_COLORS[player.role];
  const isTop = player.rating >= 88;
  const sizeClass = small ? 'card-small' : '';
  const selectedClass = selected ? 'card-selected' : '';
  const flippedClass = flipped ? 'card-flipped' : '';
  const topClass = isTop ? 'card-top-player' : '';
  const captainClass = isCaptain ? 'card-captain' : '';

  let voteHTML = '';
  if (showVote && vote !== null) {
    const isSV = vote === 'S.V.' || vote === 0;
    const eventIcons = events.map(e => {
      switch (e.type) {
        case 'goal': return '⚽'.repeat(e.count || 1);
        case 'penaltyGoal': return '🎯⚽';
        case 'missedPenalty': return '❌⚽';
        case 'assist': return '👟';
        case 'yellow': return '🟨';
        case 'red': return '🟥';
        case 'penaltySave': return '🧤✨';
        case 'cleanSheet': return '🛡️0';
        case 'conceded': return '🥅'.repeat(e.count || 1);
        case 'ownGoal': return '😱';
        default: return '';
      }
    }).join(' ');

    voteHTML = `
      <div class="card-vote-overlay ${isSV ? 'vote-sv' : ''}">
        <div class="card-vote-number">${typeof vote === 'number' ? vote.toFixed(1) : vote}</div>
        ${eventIcons ? `<div class="card-vote-events">${eventIcons}</div>` : ''}
      </div>
    `;
  }

  return `
    <div class="player-card ${sizeClass} ${selectedClass} ${flippedClass} ${topClass} ${captainClass}" 
         data-player-id="${player.id}" data-role="${player.role}"
         style="--role-from: ${roleColor.from}; --role-to: ${roleColor.to}; --role-text: ${roleColor.text}">
      <div class="card-inner">
        <div class="card-front">
          ${isTop ? '<div class="card-shimmer"></div>' : ''}
          ${isCaptain ? '<div class="captain-badge" title="Capitano">⭐️ C</div>' : ''}
          ${isBench ? '<div class="bench-badge">🪑 P</div>' : ''}
          ${isSubbedIn ? '<div class="subbed-in-badge">🔁 IN</div>' : ''}
          ${badgeText ? `<div class="custom-card-badge">${badgeText}</div>` : ''}
          <div class="card-header">
            <span class="card-role-badge">${ROLE_SHORT[player.role]}</span>
            <span class="card-nation">${player.nation}</span>
          </div>
          <div class="card-avatar">${ROLE_EMOJI[player.role]}</div>
          <div class="card-name">${player.name}</div>
          <div class="card-team">${player.team}</div>
          <div class="card-stars">${starsHTML}</div>
          ${showPrice ? `<div class="card-price">${player.basePrice}M</div>` : ''}
          ${voteHTML}
        </div>
        <div class="card-back">
          <div class="card-back-logo">⚽</div>
          <div class="card-back-text">FANTACALCIO<br>KIDS</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Mescola il mazzo per l'asta (i migliori prima, con leggera casualità)
 */
export function shuffleForAuction(players) {
  return [...players].sort((a, b) => {
    const rA = a.rating + (Math.random() * 6 - 3);
    const rB = b.rating + (Math.random() * 6 - 3);
    return rB - rA;
  });
}
