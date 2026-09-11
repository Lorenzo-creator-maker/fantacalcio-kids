// FantaCalcio Kids — Motore di simulazione e calcolo Fantacalcio Ufficiale
// Regole: Fasce Gol (66+6), Modificatore Difesa, Panchina/Sostituzioni, Bonus/Malus completi, Fattore Campo, Capitano

/**
 * Genera un numero random con distribuzione gaussiana
 */
function gaussianRandom(mean, stddev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stddev + mean;
}

/**
 * Simula la prestazione di un singolo calciatore
 * Include probabilità di Senza Voto (S.V.) per infortunio/turnover (~5%)
 */
export function simulatePlayerPerformance(player, isCaptain = false, rules = {}) {
  // ~5% di possibilità di Senza Voto (S.V.) per attivare la panchina
  if (Math.random() < 0.05) {
    return {
      playerId: player.id,
      playerName: player.name,
      team: player.team,
      role: player.role,
      rating: player.rating,
      isSV: true,
      vote: 'S.V.',
      bonus: 0,
      total: 0,
      events: [],
      isCaptain,
    };
  }

  // Voto base puro (senza bonus/malus): distribuzione centrata su 6.0
  let vote = gaussianRandom(6.0, 0.75);
  // Modulazione sul rating
  vote += (player.rating - 80) * 0.035;
  // Range voto 4.0 - 8.5
  vote = Math.max(4.0, Math.min(8.5, vote));
  // Arrotonda al mezzo voto più vicino (es. 5.5, 6.0, 6.5)
  vote = Math.round(vote * 2) / 2;

  const events = [];
  let bonus = 0;

  if (player.role === 'P') {
    // ═══════════════════════════════════════
    // PORTIERE: Gol subiti, Clean Sheet, Rigori Parati
    // ═══════════════════════════════════════
    // Probabilità gol subiti basata su rating
    const pRatingFactor = Math.max(0.6, 1 - (player.rating - 80) * 0.02);
    const concededRoll = Math.random();

    let conceded = 0;
    if (concededRoll < 0.35 / pRatingFactor) {
      // Clean sheet: 0 gol subiti!
      conceded = 0;
      bonus += 1.0;
      events.push({ type: 'cleanSheet', count: 1, label: 'Porta Inviolata (+1)' });
    } else if (concededRoll < 0.78) {
      conceded = 1;
      bonus -= 1.0;
      events.push({ type: 'conceded', count: 1, label: '1 Gol Subito (-1)' });
    } else if (concededRoll < 0.94) {
      conceded = 2;
      bonus -= 2.0;
      events.push({ type: 'conceded', count: 2, label: '2 Gol Subiti (-2)' });
    } else {
      conceded = 3;
      bonus -= 3.0;
      events.push({ type: 'conceded', count: 3, label: '3 Gol Subiti (-3)' });
    }

    // Rigore parato (+3 pt, ~6% di probabilità)
    if (Math.random() < 0.06) {
      bonus += 3.0;
      events.push({ type: 'penaltySave', count: 1, label: 'Rigore Parato (+3)' });
    }

    // Ammonizione portiere (rara, 5%)
    if (Math.random() < 0.05) {
      bonus -= 0.5;
      events.push({ type: 'yellow', count: 1, label: 'Ammonizione (-0.5)' });
    }
  } else {
    // ═══════════════════════════════════════
    // GIOCATORI DI MOVIMENTO (D, C, A)
    // ═══════════════════════════════════════
    const goalProbs = { D: 0.04, C: 0.15, A: 0.32 };
    const goalProb = (goalProbs[player.role] || 0.05) * (1 + (player.rating - 80) * 0.02);

    // ⚽ Gol segnato (+3)
    if (Math.random() < goalProb) {
      const isBrace = Math.random() < 0.07; // 7% doppietta
      const goals = isBrace ? 2 : 1;
      bonus += goals * 3.0;
      events.push({ type: 'goal', count: goals, label: goals === 2 ? 'Doppietta! (+6)' : 'Gol! (+3)' });
    }

    // 🎯⚽ Rigore segnato (+3)
    const penGoalProb = player.role === 'A' ? 0.04 : player.role === 'C' ? 0.02 : 0;
    if (Math.random() < penGoalProb) {
      bonus += 3.0;
      events.push({ type: 'penaltyGoal', count: 1, label: 'Rigore Segnato (+3)' });
    }

    // ❌⚽ Rigore fallito (-3)
    const penMissProb = player.role === 'A' ? 0.015 : player.role === 'C' ? 0.008 : 0;
    if (Math.random() < penMissProb) {
      bonus -= 3.0;
      events.push({ type: 'missedPenalty', count: 1, label: 'Rigore Sbagliato (-3)' });
    }

    // 👟 Assist (+1)
    const assistProbs = { D: 0.06, C: 0.20, A: 0.14 };
    if (Math.random() < (assistProbs[player.role] || 0.05)) {
      bonus += 1.0;
      events.push({ type: 'assist', count: 1, label: 'Assist (+1)' });
    }

    // 🟨 Ammonizione (-0.5, 12%)
    if (Math.random() < 0.12) {
      bonus -= 0.5;
      events.push({ type: 'yellow', count: 1, label: 'Ammonizione (-0.5)' });
    }

    // 🟥 Espulsione (-1.0, 1.5%)
    if (Math.random() < 0.015) {
      bonus -= 1.0;
      events.push({ type: 'red', count: 1, label: 'Espulsione (-1)' });
    }

    // 😱 Autogol (-2.0, 1%)
    if (Math.random() < 0.01) {
      bonus -= 2.0;
      events.push({ type: 'ownGoal', count: 1, label: 'Autogol (-2)' });
    }
  }

  // ⭐ Bonus Capitano: se capitano e voto base >= 6.0, aggiunge +1.0 pt
  if (isCaptain && rules.captainBonus !== false) {
    if (vote >= 6.0) {
      bonus += 1.0;
      events.push({ type: 'captain', count: 1, label: 'Bonus Capitano (+1)' });
    }
  }

  const total = Math.round((vote + bonus) * 2) / 2;

  return {
    playerId: player.id,
    playerName: player.name,
    team: player.team,
    role: player.role,
    rating: player.rating,
    isSV: false,
    vote,
    bonus,
    total,
    events,
    isCaptain,
  };
}

/**
 * Simula l'intera squadra con titolari, panchina, sostituzioni e modificatore
 */
export function simulateTeamPerformance({
  starters = [],
  bench = [],
  captainId = null,
  isHome = false,
  rules = {},
  allPlayers = [],
}) {
  const getPlayer = (id) => allPlayers.find(p => p.id === id);

  // 1. Simula tutti i titolari
  const starterSimulations = starters.map(id => {
    const p = getPlayer(id);
    if (!p) return null;
    return simulatePlayerPerformance(p, id === captainId, rules);
  }).filter(Boolean);

  // 2. Simula la panchina
  const benchSimulations = bench.map(id => {
    const p = getPlayer(id);
    if (!p) return null;
    return simulatePlayerPerformance(p, false, rules);
  }).filter(Boolean);

  // 3. Gestisci le sostituzioni per S.V. o assenti (massimo 3 cambi)
  const substitutions = [];
  const activeLineup = [];
  const usedBenchIds = new Set();
  let subCount = 0;

  for (const starterPerf of starterSimulations) {
    if (!starterPerf.isSV) {
      activeLineup.push(starterPerf);
    } else if (subCount < 3) {
      // Cerca la prima riserva disponibile dello stesso ruolo che ha preso voto
      const replacement = benchSimulations.find(b => 
        b.role === starterPerf.role && !b.isSV && !usedBenchIds.has(b.playerId)
      );

      if (replacement) {
        usedBenchIds.add(replacement.playerId);
        subCount++;
        substitutions.push({
          out: starterPerf,
          in: replacement,
        });
        // La riserva entra negli 11 attivi con flag isSubbedIn
        activeLineup.push({
          ...replacement,
          isSubbedIn: true,
          replacedPlayer: starterPerf.playerName,
        });
      } else {
        // Nessuna riserva valida trovata: resta S.V. (0 punti)
        activeLineup.push(starterPerf);
      }
    } else {
      // Superato limite 3 cambi: resta S.V.
      activeLineup.push(starterPerf);
    }
  }

  // 4. Modificatore di Difesa Classico Fantacalcio
  // Valido se ci sono almeno 4 difensori a voto + portiere a voto
  let defenseModifierBonus = 0;
  let defenseAvg = 0;
  let modifierApplied = false;

  if (rules.modifier !== false) {
    const activeGK = activeLineup.find(p => p.role === 'P' && !p.isSV);
    const activeDefs = activeLineup.filter(p => p.role === 'D' && !p.isSV);

    if (activeGK && activeDefs.length >= 4) {
      // Ordina i voti puri dei difensori in ordine decrescente e prendi i 3 migliori
      const sortedDefVotes = activeDefs
        .map(d => d.vote)
        .sort((a, b) => b - a)
        .slice(0, 3);

      const sumVotes = activeGK.vote + sortedDefVotes.reduce((s, v) => s + v, 0);
      defenseAvg = Math.round((sumVotes / 4) * 100) / 100;

      if (defenseAvg >= 7.00) {
        defenseModifierBonus = 6.0;
        modifierApplied = true;
      } else if (defenseAvg >= 6.50) {
        defenseModifierBonus = 3.0;
        modifierApplied = true;
      } else if (defenseAvg >= 6.25) {
        defenseModifierBonus = 2.0;
        modifierApplied = true;
      } else if (defenseAvg >= 6.00) {
        defenseModifierBonus = 1.0;
        modifierApplied = true;
      }
    }
  }

  // 5. Fattore Campo (+2 pt per la squadra di casa)
  const homeAdvantageBonus = (isHome && rules.homeAdvantage !== false) ? 2.0 : 0;

  // 6. Calcolo Punti Totali Fantasquadra
  const playersScore = activeLineup.reduce((sum, p) => sum + (p.isSV ? 0 : p.total), 0);
  const totalScore = Math.round((playersScore + defenseModifierBonus + homeAdvantageBonus) * 2) / 2;

  return {
    activeLineup,
    starterSimulations,
    benchSimulations,
    substitutions,
    defenseModifier: {
      applied: modifierApplied,
      avg: defenseAvg,
      bonus: defenseModifierBonus,
    },
    homeBonus: homeAdvantageBonus,
    playersScore,
    totalScore,
  };
}

/**
 * Converte i punti totali in Gol secondo le Fasce Ufficiali Fantacalcio
 * Soglia 1° gol: 66 pt
 * Ogni fascia successiva: 6 pt
 */
export function pointsToFasciaGoals(pts) {
  if (pts < 66.0) return 0;
  return Math.floor((pts - 66.0) / 6.0) + 1;
}

/**
 * Calcola il risultato ufficiale della partita in Gol e Marcatori
 * Applica le regole ufficiali di scarto per evitare pareggi ingiusti
 */
export function calculateMatchResult(homeTeamPerf, awayTeamPerf, homeName = 'Casa', awayName = 'Trasferta') {
  const homeScore = homeTeamPerf.totalScore;
  const awayScore = awayTeamPerf.totalScore;

  let homeGoals = pointsToFasciaGoals(homeScore);
  let awayGoals = pointsToFasciaGoals(awayScore);

  const diff = Math.round(Math.abs(homeScore - awayScore) * 10) / 10;

  // Regola dello scarto Fantacalcio:
  // 1. Se entrambe sono nella stessa fascia di gol (es. 1-1 a 66 vs 70.5 pt):
  //    se lo scarto è >= 4.0 punti, assegna 1 gol in più a chi è avanti
  if (homeGoals === awayGoals) {
    if (homeScore > awayScore && diff >= 4.0) {
      homeGoals += 1;
    } else if (awayScore > homeScore && diff >= 4.0) {
      awayGoals += 1;
    }
  }

  // 2. Se entrambe sono sotto i 66 punti (0-0):
  //    se la migliore ha >= 63.5 e ha almeno 4.0 punti di vantaggio, vince 1-0
  if (homeGoals === 0 && awayGoals === 0) {
    if (homeScore >= 63.5 && homeScore - awayScore >= 4.0) {
      homeGoals = 1;
    } else if (awayScore >= 63.5 && awayScore - homeScore >= 4.0) {
      awayGoals = 1;
    }
  }

  // Costruisci gli eventi marcatori virtuali con minuti di gara
  const homeGoalEvents = [];
  const awayGoalEvents = [];

  // Raccogli i marcatori effettivi dai giocatori attivi
  homeTeamPerf.activeLineup.forEach(p => {
    p.events.forEach(e => {
      if (e.type === 'goal' || e.type === 'penaltyGoal') {
        const count = e.count || 1;
        for (let i = 0; i < count; i++) {
          homeGoalEvents.push({
            player: p.playerName,
            role: p.role,
            isPenalty: e.type === 'penaltyGoal',
            minute: Math.floor(Math.random() * 85 + 5),
          });
        }
      }
    });
  });

  awayTeamPerf.activeLineup.forEach(p => {
    p.events.forEach(e => {
      if (e.type === 'goal' || e.type === 'penaltyGoal') {
        const count = e.count || 1;
        for (let i = 0; i < count; i++) {
          awayGoalEvents.push({
            player: p.playerName,
            role: p.role,
            isPenalty: e.type === 'penaltyGoal',
            minute: Math.floor(Math.random() * 85 + 5),
          });
        }
      }
    });
  });

  // Ordina per minuto
  homeGoalEvents.sort((a, b) => a.minute - b.minute);
  awayGoalEvents.sort((a, b) => a.minute - b.minute);

  // Se i gol calcolati dalle fasce superano i gol simulati individuali, aggiungi gol squadra
  while (homeGoalEvents.length < homeGoals) {
    const randomScorer = homeTeamPerf.activeLineup.find(p => p.role === 'A' && !p.isSV) || homeTeamPerf.activeLineup[0];
    homeGoalEvents.push({
      player: randomScorer ? randomScorer.playerName : homeName,
      role: randomScorer?.role || 'A',
      isPenalty: false,
      minute: Math.floor(Math.random() * 85 + 5),
    });
  }

  while (awayGoalEvents.length < awayGoals) {
    const randomScorer = awayTeamPerf.activeLineup.find(p => p.role === 'A' && !p.isSV) || awayTeamPerf.activeLineup[0];
    awayGoalEvents.push({
      player: randomScorer ? randomScorer.playerName : awayName,
      role: randomScorer?.role || 'A',
      isPenalty: false,
      minute: Math.floor(Math.random() * 85 + 5),
    });
  }

  // Prendi esattamente il numero di gol della partita
  const finalHomeGoals = homeGoalEvents.slice(0, homeGoals);
  const finalAwayGoals = awayGoalEvents.slice(0, awayGoals);

  return {
    homeGoals,
    awayGoals,
    homeScore,
    awayScore,
    homeGoalScorers: finalHomeGoals,
    awayGoalScorers: finalAwayGoals,
    isHomeWin: homeGoals > awayGoals,
    isAwayWin: awayGoals > homeGoals,
    isDraw: homeGoals === awayGoals,
  };
}

/**
 * Inizializza la classifica con tutti i campi ufficiali (GF, GS, DR)
 */
export function createStandings(numManagers) {
  return Array.from({ length: numManagers }, (_, i) => ({
    managerId: i,
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    totalScore: 0,
    form: [], // 'W', 'D', 'L'
  }));
}

/**
 * Aggiorna la classifica dopo una partita con gol e fantapunti
 */
export function updateStandings(standings, homeIdx, awayIdx, homeGoals, awayGoals, homeScore, awayScore) {
  const home = standings.find(s => s.managerId === homeIdx);
  const away = standings.find(s => s.managerId === awayIdx);
  if (!home || !away) return standings;

  home.played++;
  away.played++;
  home.goalsFor += homeGoals;
  home.goalsAgainst += awayGoals;
  home.goalDiff = home.goalsFor - home.goalsAgainst;
  home.totalScore = Math.round((home.totalScore + homeScore) * 10) / 10;

  away.goalsFor += awayGoals;
  away.goalsAgainst += homeGoals;
  away.goalDiff = away.goalsFor - away.goalsAgainst;
  away.totalScore = Math.round((away.totalScore + awayScore) * 10) / 10;

  if (homeGoals > awayGoals) {
    home.won++;
    home.points += 3;
    home.form.push('W');
    away.lost++;
    away.form.push('L');
  } else if (awayGoals > homeGoals) {
    away.won++;
    away.points += 3;
    away.form.push('W');
    home.lost++;
    home.form.push('L');
  } else {
    home.drawn++;
    away.drawn++;
    home.points += 1;
    away.points += 1;
    home.form.push('D');
    away.form.push('D');
  }

  // Tieni solo le ultime 5 partite per la forma
  if (home.form.length > 5) home.form.shift();
  if (away.form.length > 5) away.form.shift();

  return standings;
}

/**
 * Genera il calendario del campionato
 */
export function generateSchedule(numManagers) {
  if (numManagers === 2) {
    return [
      [{ home: 0, away: 1 }],
      [{ home: 1, away: 0 }],
      [{ home: 0, away: 1 }],
      [{ home: 1, away: 0 }],
    ];
  }

  if (numManagers === 3) {
    return [
      [{ home: 0, away: 1 }],
      [{ home: 1, away: 2 }],
      [{ home: 2, away: 0 }],
      [{ home: 1, away: 0 }],
      [{ home: 2, away: 1 }],
      [{ home: 0, away: 2 }],
    ];
  }

  // 4 giocatori: 6 giornate andata e ritorno
  return [
    [{ home: 0, away: 1 }, { home: 2, away: 3 }],
    [{ home: 0, away: 2 }, { home: 1, away: 3 }],
    [{ home: 0, away: 3 }, { home: 1, away: 2 }],
    [{ home: 1, away: 0 }, { home: 3, away: 2 }],
    [{ home: 2, away: 0 }, { home: 3, away: 1 }],
    [{ home: 3, away: 0 }, { home: 2, away: 1 }],
  ];
}

/**
 * Calcola la classifica marcatori di tutti i gol segnati nel campionato
 */
export function calculateTopScorers(results = [], allPlayers = []) {
  const goalCounts = {};

  results.forEach(res => {
    const allScorers = [
      ...(res.homeGoalScorers || []),
      ...(res.awayGoalScorers || [])
    ];

    allScorers.forEach(scorer => {
      const name = scorer.player;
      if (!name) return;
      if (!goalCounts[name]) {
        const playerObj = allPlayers.find(p => p.name === name);
        goalCounts[name] = {
          name,
          goals: 0,
          penalties: 0,
          role: playerObj?.role || scorer.role || 'A',
          team: playerObj?.team || '',
          nation: playerObj?.nation || '⚽',
        };
      }
      goalCounts[name].goals++;
      if (scorer.isPenalty) goalCounts[name].penalties++;
    });
  });

  return Object.values(goalCounts).sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return a.penalties - b.penalties;
  });
}

/**
 * Restituisce l'emoji per un tipo di evento
 */
export function getEventEmoji(type) {
  const emojis = {
    goal: '⚽',
    penaltyGoal: '🎯⚽',
    missedPenalty: '❌⚽',
    assist: '👟',
    yellow: '🟨',
    red: '🟥',
    penaltySave: '🧤✨',
    cleanSheet: '🛡️0',
    conceded: '🥅',
    ownGoal: '😱',
    captain: '⭐️',
  };
  return emojis[type] || '';
}

/**
 * Restituisce il testo in italiano per un tipo di evento
 */
export function getEventText(type) {
  const texts = {
    goal: 'Gol',
    penaltyGoal: 'Rigore Segnato',
    missedPenalty: 'Rigore Fallito',
    assist: 'Assist',
    yellow: 'Ammonizione',
    red: 'Espulsione',
    penaltySave: 'Rigore Parato',
    cleanSheet: 'Porta Inviolata',
    conceded: 'Gol Subito',
    ownGoal: 'Autogol',
    captain: 'Capitano',
  };
  return texts[type] || type;
}
