import Dexie, { Table } from 'dexie';

// Definição das interfaces dos modelos
export interface Player {
  id?: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id?: number;
  name: string;
  players: number[]; // Array de IDs de jogadores
  createdAt: Date;
  updatedAt: Date;
}

export enum TournamentType {
  PLAYERS = 'players',
  TEAMS = 'teams'
}

export enum TournamentStatus {
  CREATED = 'created',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished'
}

export interface Tournament {
  id?: number;
  name: string;
  type: TournamentType;
  participants: number[]; // IDs de jogadores ou times, dependendo do tipo
  matches: Match[];
  status: TournamentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id?: number;
  tournamentId: number;
  participant1Id: number;
  participant2Id: number;
  participant1Score?: number;
  participant2Score?: number;
  winner?: number; // ID do vencedor (jogador ou time)
  createdAt: Date;
  updatedAt: Date;
}

// Classe do banco de dados
class TournamentDatabase extends Dexie {
  players!: Table<Player>;
  teams!: Table<Team>;
  tournaments!: Table<Tournament>;
  matches!: Table<Match>;

  constructor() {
    super('TournamentDatabase');
    
    this.version(1).stores({
      players: '++id, name',
      teams: '++id, name',
      tournaments: '++id, name, type, status',
      matches: '++id, tournamentId, participant1Id, participant2Id, winner'
    });
  }
}

export const db = new TournamentDatabase();

// Funções auxiliares para o CRUD
export const playersCrud = {
  getAll: async () => await db.players.toArray(),
  getById: async (id: number) => await db.players.get(id),
  add: async (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    return await db.players.add({
      ...player,
      createdAt: now,
      updatedAt: now
    });
  },
  update: async (id: number, player: Partial<Omit<Player, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const now = new Date();
    return await db.players.update(id, {
      ...player,
      updatedAt: now
    });
  },
  remove: async (id: number) => await db.players.delete(id)
};

export const teamsCrud = {
  getAll: async () => await db.teams.toArray(),
  getById: async (id: number) => await db.teams.get(id),
  add: async (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    return await db.teams.add({
      ...team,
      createdAt: now,
      updatedAt: now
    });
  },
  update: async (id: number, team: Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const now = new Date();
    return await db.teams.update(id, {
      ...team,
      updatedAt: now
    });
  },
  addPlayerToTeam: async (teamId: number, playerId: number) => {
    const team = await db.teams.get(teamId);
    if (team) {
      // Verificar se o jogador já está no time
      if (team.players.includes(playerId)) {
        console.log("Jogador já está no time");
        return true; // Retorna true porque o estado final é o desejado
      }
      
      // Verificar se o jogador existe
      const player = await db.players.get(playerId);
      if (!player) {
        console.error("Jogador não encontrado");
        return false;
      }
      
      // Adicionar jogador ao time
      const players = [...team.players, playerId];
      const result = await db.teams.update(teamId, { 
        players, 
        updatedAt: new Date() 
      });
      
      return result > 0; // Retorna true se a atualização foi bem-sucedida
    }
    return false;
  },
  removePlayerFromTeam: async (teamId: number, playerId: number) => {
    const team = await db.teams.get(teamId);
    if (team) {
      // Verificar se o jogador está no time
      if (!team.players.includes(playerId)) {
        console.log("Jogador não está no time");
        return true; // Retorna true porque o estado final é o desejado
      }
      
      // Remover jogador do time
      const players = team.players.filter(id => id !== playerId);
      const result = await db.teams.update(teamId, { 
        players, 
        updatedAt: new Date() 
      });
      
      return result > 0; // Retorna true se a atualização foi bem-sucedida
    }
    return false;
  },
  remove: async (id: number) => await db.teams.delete(id)
};

export const tournamentsCrud = {
  getAll: async () => await db.tournaments.toArray(),
  getById: async (id: number) => await db.tournaments.get(id),
  add: async (tournament: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    return await db.tournaments.add({
      ...tournament,
      createdAt: now,
      updatedAt: now
    });
  },
  update: async (id: number, tournament: Partial<Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const now = new Date();
    try {
      const result = await db.tournaments.update(id, {
        ...tournament,
        updatedAt: now
      });
      return result > 0; // Retorna true se a atualização foi bem-sucedida
    } catch (error) {
      console.error("Erro ao atualizar torneio:", error);
      return false;
    }
  },
  updateMatchResult: async (tournamentId: number, matchId: number, participant1Score: number, participant2Score: number) => {
    try {
      const tournament = await db.tournaments.get(tournamentId);
      
      if (!tournament) {
        console.error("Torneio não encontrado");
        return false;
      }
      
      // Encontrar a partida a ser atualizada
      const matchIndex = tournament.matches.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) {
        console.error("Partida não encontrada no torneio");
        return false;
      }
      
      // Criar uma cópia das partidas para evitar problemas de referência
      const updatedMatches = [...tournament.matches];
      
      // Determinar o vencedor
      const winner = participant1Score > participant2Score 
        ? updatedMatches[matchIndex].participant1Id 
        : participant2Score > participant1Score 
          ? updatedMatches[matchIndex].participant2Id 
          : undefined;
      
      // Atualizar a partida
      updatedMatches[matchIndex] = {
        ...updatedMatches[matchIndex],
        participant1Score,
        participant2Score,
        winner,
        updatedAt: new Date()
      };
      
      // Verificar se todas as partidas foram realizadas
      const allMatchesCompleted = updatedMatches.every(match => 
        match.participant1Score !== undefined && match.participant2Score !== undefined
      );
      
      // Atualizar o status do torneio se todas as partidas foram realizadas
      const status = allMatchesCompleted ? TournamentStatus.FINISHED : tournament.status;
      
      // Atualizar o torneio
      const result = await db.tournaments.update(tournamentId, {
        matches: updatedMatches,
        status,
        updatedAt: new Date()
      });
      
      return result > 0; // Retorna true se a atualização foi bem-sucedida
    } catch (error) {
      console.error("Erro ao atualizar resultado da partida:", error);
      return false;
    }
  },
  remove: async (id: number) => await db.tournaments.delete(id)
};

export default db; 