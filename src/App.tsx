import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { Button } from "./components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Tournament, TournamentStatus, TournamentType, tournamentsCrud } from "./lib/db";
import CreateTournament from "./pages/CreateTournament";
import Home from "./pages/Home";
import Players from "./pages/Players";
import Teams from "./pages/Teams";

// Componente de Torneios definido inline
const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setIsLoading(true);
    try {
      const allTournaments = await tournamentsCrud.getAll();
      setTournaments(allTournaments);
    } catch (error) {
      console.error("Erro ao carregar torneios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Torneios</h1>
        <Button asChild>
          <Link to="/tournaments/new">Criar Novo Torneio</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Carregando torneios...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhum torneio cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell className="font-medium">{tournament.name}</TableCell>
                    <TableCell>
                      {tournament.type === TournamentType.PLAYERS ? "Jogadores" : "Times"}
                    </TableCell>
                    <TableCell>
                      {tournament.status === TournamentStatus.CREATED ? "Criado" :
                       tournament.status === TournamentStatus.IN_PROGRESS ? "Em Andamento" : "Finalizado"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/tournaments/${tournament.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="players" element={<Players />} />
        <Route path="teams" element={<Teams />} />
        <Route path="tournaments">
          <Route index element={<Tournaments />} />
          <Route path="new" element={<CreateTournament />} />
        </Route>
      </Route>
    </Routes>
  );
}
