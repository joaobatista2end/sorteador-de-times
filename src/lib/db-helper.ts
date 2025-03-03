import { db } from './db';

/**
 * Verifica se o IndexedDB está disponível e funcionando corretamente
 * @returns Promise que resolve para true se o IndexedDB estiver funcionando
 */
export async function checkIndexedDBSupport(): Promise<boolean> {
  try {
    // Tenta abrir o banco de dados
    await db.open();
    console.log('IndexedDB está funcionando corretamente');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar IndexedDB:', error);
    return false;
  }
}

/**
 * Exporta os dados do banco para JSON
 * Útil para backup ou debug
 */
export async function exportDatabaseToJSON(): Promise<string> {
  try {
    const players = await db.players.toArray();
    const teams = await db.teams.toArray();
    const tournaments = await db.tournaments.toArray();
    
    const data = {
      players,
      teams,
      tournaments,
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Erro ao exportar banco de dados:', error);
    throw error;
  }
}

/**
 * Importa dados de um JSON para o banco
 * Útil para restaurar dados ou migrar entre ambientes
 */
export async function importDatabaseFromJSON(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    
    // Usar transação para garantir consistência
    await db.transaction('rw', [db.players, db.teams, db.tournaments], async () => {
      // Limpar tabelas existentes
      await db.players.clear();
      await db.teams.clear();
      await db.tournaments.clear();
      
      // Importar dados
      if (data.players?.length) await db.players.bulkAdd(data.players);
      if (data.teams?.length) await db.teams.bulkAdd(data.teams);
      if (data.tournaments?.length) await db.tournaments.bulkAdd(data.tournaments);
    });
    
    console.log('Dados importados com sucesso');
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    throw error;
  }
} 