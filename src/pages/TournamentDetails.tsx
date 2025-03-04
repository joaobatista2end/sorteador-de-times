import { BarChart3, ChevronRight, Edit, Plus, Trash, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Breadcrumb } from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../components/ui/responsive-dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Match, Player, Team, Tournament, TournamentFormat, TournamentStatus, TournamentType, playersCrud, teamsCrud, tournamentsCrud } from "../lib/db";

type Participant = Player | Team;

type RankingItem = {
  participant: Participant;
  id: number;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
};

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tournamentId = parseInt(id || "0");
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [score1, setScore1] = useState<string>("");
  const [score2, setScore2] = useState<string>("");
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [isAddParticipantDialogOpen, setIsAddParticipantDialogOpen] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [isParticipantDetailsOpen, setIsParticipantDetailsOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (tournamentId) {
      loadTournament();
    }
  }, [tournamentId]);

  // Recalcular o ranking sempre que as partidas ou participantes mudarem
  useEffect(() => {
    if (tournament && participants.length > 0) {
      calculateRanking(matches, tournament.participants);
    }
  }, [matches, participants]);

  const loadTournament = async () => {
    setIsLoading(true);
    try {
      const tournamentData = await tournamentsCrud.getById(tournamentId);
      if (!tournamentData) {
        navigate("/tournaments");
        return;
      }
      
      setTournament(tournamentData);
      await loadParticipants(tournamentData);
      await loadMatches(tournamentData);
    } catch (error) {
      console.error("Erro ao carregar torneio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipants = async (tournamentData: Tournament) => {
    try {
      const participantData = await Promise.all(
        tournamentData.participants.map(async (id) => {
          if (tournamentData.type === TournamentType.PLAYERS) {
            return await playersCrud.getById(id);
          } else {
            return await teamsCrud.getById(id);
          }
        })
      );
      
      // Filter out undefined values
      const validParticipants = participantData.filter(Boolean) as Participant[];
      setParticipants(validParticipants);
      
      // Load available participants (not already in the tournament)
      await loadAvailableParticipants(tournamentData);
    } catch (error) {
      console.error("Erro ao carregar participantes:", error);
    }
  };

  const loadAvailableParticipants = async (tournamentData: Tournament) => {
    try {
      if (tournamentData.type === TournamentType.PLAYERS) {
        const allPlayers = await playersCrud.getAll();
        setAvailableParticipants(
          allPlayers.filter(player => !tournamentData.participants.includes(player.id!))
        );
      } else {
        const allTeams = await teamsCrud.getAll();
        setAvailableParticipants(
          allTeams.filter(team => !tournamentData.participants.includes(team.id!))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar participantes disponíveis:", error);
    }
  };

  const loadMatches = async (tournamentData: Tournament) => {
    try {
      setMatches(tournamentData.matches);
      calculateRanking(tournamentData.matches, tournamentData.participants);
    } catch (error) {
      console.error("Erro ao carregar partidas:", error);
    }
  };

  const calculateRanking = (matchesData: Match[], participantIds: number[]) => {
    // Initialize ranking with all participants
    const rankingData: Record<number, RankingItem> = {};
    
    participantIds.forEach(id => {
      const participant = participants.find(p => p.id === id);
      if (participant) {
        rankingData[id] = {
          participant,
          id,
          name: participant.name,
          wins: 0,
          losses: 0,
          draws: 0,
          points: 0
        };
      }
    });
    
    // Calculate stats based on matches with scores
    const matchesWithScores = matchesData.filter(
      match => match.participant1Score !== undefined && match.participant2Score !== undefined
    );
    
    matchesWithScores.forEach(match => {
      const p1 = match.participant1Id;
      const p2 = match.participant2Id;
      
      if (match.participant1Score! > match.participant2Score!) {
        // Player 1 wins
        if (rankingData[p1]) {
          rankingData[p1].wins += 1;
          rankingData[p1].points += 3;
        }
        if (rankingData[p2]) {
          rankingData[p2].losses += 1;
        }
      } else if (match.participant1Score! < match.participant2Score!) {
        // Player 2 wins
        if (rankingData[p2]) {
          rankingData[p2].wins += 1;
          rankingData[p2].points += 3;
        }
        if (rankingData[p1]) {
          rankingData[p1].losses += 1;
        }
      } else {
        // Draw
        if (rankingData[p1]) {
          rankingData[p1].draws += 1;
          rankingData[p1].points += 1;
        }
        if (rankingData[p2]) {
          rankingData[p2].draws += 1;
          rankingData[p2].points += 1;
        }
      }
    });
    
    // Convert to array and sort by points (and then by wins if points are equal)
    const sortedRanking = Object.values(rankingData).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points; // Primeiro por pontos
      }
      if (b.wins !== a.wins) {
        return b.wins - a.wins; // Depois por vitórias
      }
      return a.losses - b.losses; // Por fim, menos derrotas
    });
    
    setRanking(sortedRanking);
  };

  const handleDeleteTournament = async () => {
    if (!tournament) return;
    
    try {
      await tournamentsCrud.remove(tournament.id!);
      navigate("/tournaments");
    } catch (error) {
      console.error("Erro ao excluir torneio:", error);
    }
  };

  const openMatchDialog = (match: Match) => {
    setCurrentMatch(match);
    setScore1(match.participant1Score?.toString() || "");
    setScore2(match.participant2Score?.toString() || "");
    setIsMatchDialogOpen(true);
  };

  const handleSaveMatchResult = async () => {
    if (!currentMatch || !tournament) return;
    
    try {
      const score1Num = parseInt(score1);
      const score2Num = parseInt(score2);
      
      if (isNaN(score1Num) || isNaN(score2Num)) {
        alert("Por favor, insira pontuações válidas");
        return;
      }
      
      await tournamentsCrud.updateMatchResult(
        tournament.id!,
        currentMatch.id!,
        score1Num,
        score2Num
      );
      
      setIsMatchDialogOpen(false);
      loadTournament();
    } catch (error) {
      console.error("Erro ao salvar resultado da partida:", error);
    }
  };

  const generateMatches = async () => {
    if (!tournament) return;

    try {
      // Verificar se já existem partidas
      if (tournament.matches.length > 0) {
        // Verificar se todas as combinações possíveis já foram geradas
        const participantIds = tournament.participants;
        const possibleMatchCount = (participantIds.length * (participantIds.length - 1)) / 2;
        
        // Para torneios de times, multiplicamos pelo número de partidas por confronto (3 ou 5)
        const matchesPerConfrontation = tournament.type === TournamentType.TEAMS 
          ? (tournament.format === TournamentFormat.BEST_OF_3 ? 3 : 5) 
          : 1;
          
        const totalPossibleMatches = possibleMatchCount * matchesPerConfrontation;
        
        // Se já temos todas as partidas possíveis, alertamos o usuário
        if (tournament.matches.length >= totalPossibleMatches) {
          alert("Todas as partidas possíveis já foram geradas.");
          return;
        }
      }

      // Gerar novas partidas
      const newMatches: Match[] = [];
      const participantIds = tournament.participants;

      // Para cada par de participantes
      for (let i = 0; i < participantIds.length; i++) {
        for (let j = i + 1; j < participantIds.length; j++) {
          const participant1Id = participantIds[i];
          const participant2Id = participantIds[j];

          // Verificar se já existe uma partida entre esses participantes
          const existingMatches = tournament.matches.filter(
            (m) =>
              (m.participant1Id === participant1Id && m.participant2Id === participant2Id) ||
              (m.participant1Id === participant2Id && m.participant2Id === participant1Id)
          );

          // Para torneios de jogadores, geramos apenas uma partida por par
          if (tournament.type === TournamentType.PLAYERS) {
            if (existingMatches.length === 0) {
              // Criar uma nova partida
              const newMatch: Match = {
                id: Date.now() + i + j, // ID temporário
                tournamentId: tournament.id!,
                participant1Id,
                participant2Id,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              newMatches.push(newMatch);
            }
          } 
          // Para torneios de times, geramos múltiplas partidas (melhor de 3 ou melhor de 5)
          else if (tournament.type === TournamentType.TEAMS) {
            const matchesNeeded = tournament.format === TournamentFormat.BEST_OF_3 ? 3 : 5;
            
            // Se não temos partidas suficientes para este confronto, geramos as faltantes
            if (existingMatches.length < matchesNeeded) {
              for (let k = existingMatches.length; k < matchesNeeded; k++) {
                const newMatch: Match = {
                  id: Date.now() + i + j + k, // ID temporário
                  tournamentId: tournament.id!,
                  participant1Id,
                  participant2Id,
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                newMatches.push(newMatch);
              }
            }
          }
        }
      }

      if (newMatches.length === 0) {
        alert("Não há novas partidas para gerar.");
        return;
      }

      // Atualizar o torneio com as novas partidas
      const updatedMatches = [...tournament.matches, ...newMatches];
      const updatedTournament = {
        ...tournament,
        matches: updatedMatches,
        status: TournamentStatus.IN_PROGRESS,
        updatedAt: new Date()
      };

      const success = await tournamentsCrud.update(tournament.id!, {
        matches: updatedMatches,
        status: TournamentStatus.IN_PROGRESS
      });
      
      if (success) {
        setTournament(updatedTournament);
        setMatches(updatedMatches);
        alert(`${newMatches.length} novas partidas foram geradas com sucesso!`);
      } else {
        alert("Erro ao gerar partidas. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar partidas:", error);
      alert("Ocorreu um erro ao gerar as partidas.");
    }
  };

  const handleAddParticipant = async () => {
    if (!tournament || !selectedParticipantId) return;
    
    try {
      const participantId = parseInt(selectedParticipantId);
      const updatedParticipants = [...tournament.participants, participantId];
      
      await tournamentsCrud.update(tournament.id!, {
        participants: updatedParticipants
      });
      
      setIsAddParticipantDialogOpen(false);
      setSelectedParticipantId("");
      loadTournament();
    } catch (error) {
      console.error("Erro ao adicionar participante:", error);
    }
  };

  const getParticipantName = (id: number) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : `Participante #${id}`;
  };

  const openParticipantDetails = async (participant: Participant) => {
    setSelectedParticipant(participant);
    
    // Se for um time, carrega os jogadores
    if (tournament?.type === TournamentType.TEAMS) {
      const team = participant as Team;
      if (team.players && team.players.length > 0) {
        const players: Player[] = [];
        for (const playerId of team.players) {
          const player = await playersCrud.getById(playerId);
          if (player) {
            players.push(player);
          }
        }
        setTeamPlayers(players);
      } else {
        setTeamPlayers([]);
      }
    }
    
    setIsParticipantDetailsOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando torneio...</div>;
  }

  if (!tournament) {
    return <div className="text-center py-8">Torneio não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb 
        segments={[
          { name: "Torneios", href: "/tournaments" },
          { name: tournament.name }
        ]} 
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl mb-4 sm:text-3xl font-bold">{tournament.name}</h1>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant={tournament.type === TournamentType.PLAYERS ? "players" : "teams"}>
              {tournament.type === TournamentType.PLAYERS ? "Jogadores" : "Times"}
            </Badge>
            <Badge variant={
              tournament.status === TournamentStatus.CREATED 
                ? "created" 
                : tournament.status === TournamentStatus.IN_PROGRESS 
                  ? "in-progress" 
                  : "finished"
            }>
              {tournament.status === TournamentStatus.CREATED ? "Criado" : 
               tournament.status === TournamentStatus.IN_PROGRESS ? "Em Andamento" : "Finalizado"}
            </Badge>
            {tournament.type === TournamentType.TEAMS && tournament.format && (
              <Badge variant={tournament.format === TournamentFormat.BEST_OF_3 ? "best-of-3" : "best-of-5"}>
                {tournament.format === TournamentFormat.BEST_OF_3 ? "Melhor de 3" : "Melhor de 5"}
              </Badge>
            )}
          </div>
        </div>
        <Button 
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="self-end sm:self-auto"
        >
          <Trash className="h-4 w-4 mr-1" />
          Excluir Torneio
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-cente mb-2">
                  <Trophy className="h-5 w-5 mr-2" />
                  Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {ranking.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum resultado registrado
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ranking.map((item, index) => {
                        // Determinar a variante do badge com base na posição
                        const badgeVariant = index === 0 
                          ? "gold" 
                          : index === 1 
                            ? "silver" 
                            : index === 2 
                              ? "bronze" 
                              : "outline";
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`flex items-center justify-between p-2 rounded-md ${
                              index < 3 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/20'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Badge 
                                variant={badgeVariant} 
                                className="w-6 h-6 flex items-center justify-center p-0"
                              >
                                {index + 1}
                              </Badge>
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex flex-col items-center">
                                <span className="text-muted-foreground text-xs">V</span>
                                <span>{item.wins}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-muted-foreground text-xs">E</span>
                                <span>{item.draws}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-muted-foreground text-xs">D</span>
                                <span>{item.losses}</span>
                              </div>
                              <div className="flex flex-col items-center font-medium">
                                <span className="text-muted-foreground text-xs">Pts</span>
                                <span>{item.points}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center mb-2">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/20 p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">Participantes</div>
                      <div className="text-2xl font-bold mt-1 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        {tournament?.participants.length || 0}
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">Partidas</div>
                      <div className="text-2xl font-bold mt-1">
                        {matches.length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/20 p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">Partidas Realizadas</div>
                      <div className="text-2xl font-bold mt-1">
                        {matches.filter(m => m.participant1Score !== undefined).length}
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">Partidas Pendentes</div>
                      <div className="text-2xl font-bold mt-1">
                        {matches.filter(m => m.participant1Score === undefined).length}
                      </div>
                    </div>
                  </div>
                  
                  {tournament?.status === TournamentStatus.FINISHED && (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-md">
                      <div className="text-sm font-medium">Torneio Finalizado</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Todas as partidas foram realizadas. O ranking final está disponível.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Partidas</h2>
            {tournament.status === TournamentStatus.CREATED && (
              <Button onClick={generateMatches} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Gerar Partidas
              </Button>
            )}
          </div>
          
          {matches.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Nenhuma partida gerada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {matches.map((match) => (
                <Card key={match.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                        <div className="text-center sm:text-right flex-1 sm:flex-none">
                          <p className="font-medium truncate max-w-[120px] sm:max-w-none">
                            {getParticipantName(match.participant1Id)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30">
                          {match.participant1Score !== undefined && match.participant2Score !== undefined ? (
                            <>
                              <span className="font-bold">{match.participant1Score}</span>
                              <span className="text-muted-foreground">x</span>
                              <span className="font-bold">{match.participant2Score}</span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">Não realizada</span>
                          )}
                        </div>
                        
                        <div className="text-center sm:text-left flex-1 sm:flex-none">
                          <p className="font-medium truncate max-w-[120px] sm:max-w-none">
                            {getParticipantName(match.participant2Id)}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMatchDialog(match)}
                        className="w-full sm:w-auto"
                      >
                        {match.participant1Score !== undefined ? (
                          <>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Registrar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Participantes</h2>
            {tournament.status === TournamentStatus.CREATED && (
              <Button onClick={() => setIsAddParticipantDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            )}
          </div>
          
          {participants.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Nenhum participante</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {participants.map((participant) => (
                <Card key={participant.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        {tournament.type === TournamentType.TEAMS && (
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Users className="h-3 w-3 mr-1" />
                            {(participant as Team).players?.length || 0} jogadores
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openParticipantDetails(participant)}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Tournament Dialog */}
      <ResponsiveDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Confirmar Exclusão</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Tem certeza que deseja excluir o torneio "{tournament.name}"? Esta ação não pode ser desfeita.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={handleDeleteTournament}>
              Excluir
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Match Result Dialog */}
      <ResponsiveDialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Registrar Resultado</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Informe o resultado da partida entre {currentMatch && getParticipantName(currentMatch.participant1Id)} e {currentMatch && getParticipantName(currentMatch.participant2Id)}.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <div className="grid grid-cols-3 items-center gap-4 py-4">
            <div className="text-center">
              <p className="mb-2 text-sm truncate">{currentMatch && getParticipantName(currentMatch.participant1Id)}</p>
              <Input
                type="number"
                min="0"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                className="text-center"
              />
            </div>
            <div className="text-center text-2xl font-bold">
              X
            </div>
            <div className="text-center">
              <p className="mb-2 text-sm truncate">{currentMatch && getParticipantName(currentMatch.participant2Id)}</p>
              <Input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                className="text-center"
              />
            </div>
          </div>
          <ResponsiveDialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsMatchDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSaveMatchResult}>
              Salvar Resultado
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Add Participant Dialog */}
      <ResponsiveDialog open={isAddParticipantDialogOpen} onOpenChange={setIsAddParticipantDialogOpen}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Adicionar Participante</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Selecione um {tournament.type === TournamentType.PLAYERS ? "jogador" : "time"} para adicionar ao torneio.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <div className="py-4">
            {availableParticipants.length === 0 ? (
              <div className="text-center py-4 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">
                  Nenhum {tournament.type === TournamentType.PLAYERS ? "jogador" : "time"} disponível
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {availableParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer ${
                        selectedParticipantId === participant.id?.toString() ? "bg-muted" : "bg-muted/20"
                      }`}
                      onClick={() => setSelectedParticipantId(participant.id?.toString() || "")}
                    >
                      <input
                        type="radio"
                        checked={selectedParticipantId === participant.id?.toString()}
                        onChange={() => {}}
                        className="h-4 w-4"
                      />
                      <span className="font-medium">{participant.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <ResponsiveDialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsAddParticipantDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="w-full sm:w-auto"
              onClick={handleAddParticipant}
              disabled={!selectedParticipantId}
            >
              Adicionar
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Participant Details Dialog */}
      <ResponsiveDialog open={isParticipantDetailsOpen} onOpenChange={setIsParticipantDetailsOpen}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Detalhes do Participante</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Informações sobre {selectedParticipant?.name}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          
          <div className="py-4">
            {selectedParticipant && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/20">
                  <span>Nome</span>
                  <span className="font-medium">{selectedParticipant.name}</span>
                </div>
                
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/20">
                  <span>Data de Criação</span>
                  <span className="font-medium">{new Date(selectedParticipant.createdAt).toLocaleDateString()}</span>
                </div>
                
                {tournament?.type === TournamentType.TEAMS && (
                  <>
                    <div className="flex justify-between items-center p-2 rounded-md bg-muted/20">
                      <span>Jogadores</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{(selectedParticipant as Team).players?.length || 0}</span>
                      </Badge>
                    </div>
                    
                    {teamPlayers.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Lista de Jogadores</h4>
                        <ScrollArea className="h-[200px] pr-4">
                          <div className="space-y-2">
                            {teamPlayers.map((player) => (
                              <div key={player.id} className="p-2 rounded-md bg-muted/10">
                                <p className="font-medium">{player.name}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </>
                )}
                
                {/* Estatísticas do participante no torneio */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Estatísticas no Torneio</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-md bg-muted/20 text-center">
                      <p className="text-xs text-muted-foreground">Vitórias</p>
                      <p className="font-bold">
                        {ranking.find(r => r.id === selectedParticipant.id)?.wins || 0}
                      </p>
                    </div>
                    <div className="p-2 rounded-md bg-muted/20 text-center">
                      <p className="text-xs text-muted-foreground">Empates</p>
                      <p className="font-bold">
                        {ranking.find(r => r.id === selectedParticipant.id)?.draws || 0}
                      </p>
                    </div>
                    <div className="p-2 rounded-md bg-muted/20 text-center">
                      <p className="text-xs text-muted-foreground">Derrotas</p>
                      <p className="font-bold">
                        {ranking.find(r => r.id === selectedParticipant.id)?.losses || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 p-2 rounded-md bg-primary/10 text-center">
                    <p className="text-xs text-muted-foreground">Pontos Totais</p>
                    <p className="font-bold text-lg">
                      {ranking.find(r => r.id === selectedParticipant.id)?.points || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <ResponsiveDialogFooter className="gap-2 sm:gap-0">
            <Button className="w-full sm:w-auto" onClick={() => setIsParticipantDetailsOpen(false)}>
              Fechar
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
};

export default TournamentDetails; 