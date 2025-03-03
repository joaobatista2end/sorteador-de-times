import { CalendarIcon, Plus, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Breadcrumb } from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tournament, TournamentFormat, TournamentStatus, TournamentType, tournamentsCrud } from "../lib/db";

const Tournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setIsLoading(true);
      const data = await tournamentsCrud.getAll();
      setTournaments(data);
    } catch (error) {
      console.error("Erro ao carregar torneios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.CREATED:
        return "created";
      case TournamentStatus.IN_PROGRESS:
        return "in-progress";
      case TournamentStatus.FINISHED:
        return "finished";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.CREATED:
        return "Criado";
      case TournamentStatus.IN_PROGRESS:
        return "Em Andamento";
      case TournamentStatus.FINISHED:
        return "Finalizado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb segments={[{ name: "Torneios" }]} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Torneios</h1>
        <Button onClick={() => navigate("/tournaments/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Torneio
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando torneios...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Nenhum torneio cadastrado</p>
            </div>
          ) : (
            tournaments.map((tournament) => (
              <Link to={`/tournaments/${tournament.id}`} key={tournament.id}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="truncate">{tournament.name}</CardTitle>
                      <Trophy className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant={tournament.type === TournamentType.PLAYERS ? "players" : "teams"}>
                        {tournament.type === TournamentType.PLAYERS ? "Jogadores" : "Times"}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(tournament.status)}>
                        {getStatusText(tournament.status)}
                      </Badge>
                      {tournament.type === TournamentType.TEAMS && tournament.format && (
                        <Badge variant={tournament.format === TournamentFormat.BEST_OF_3 ? "best-of-3" : "best-of-5"}>
                          {tournament.format === TournamentFormat.BEST_OF_3 ? "Melhor de 3" : "Melhor de 5"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span>Criado em {new Date(tournament.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3" />
                        <span>{tournament.participants.length} participantes</span>
                      </div>
                      <div className="text-sm">
                        {tournament.matches.length} partidas
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Tournaments; 