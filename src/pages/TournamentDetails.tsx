import { ChevronRight, Edit, Plus, Trash, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
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
import { Match, Player, Team, Tournament, TournamentStatus, TournamentType, playersCrud, teamsCrud, tournamentsCrud } from "../lib/db";

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

  useEffect(() => {
    if (tournamentId) {
      loadTournament();
    }
  }, [tournamentId]);

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
    
    // Calculate stats based on matches
    matchesData.forEach(match => {
      if (match.participant1Score !== undefined && match.participant2Score !== undefined) {
        const p1 = match.participant1Id;
        const p2 = match.participant2Id;
        
        if (match.participant1Score > match.participant2Score) {
          // Player 1 wins
          if (rankingData[p1]) {
            rankingData[p1].wins += 1;
            rankingData[p1].points += 3;
          }
          if (rankingData[p2]) {
            rankingData[p2].losses += 1;
          }
        } else if (match.participant1Score < match.participant2Score) {
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
      }
    });
    
    // Convert to array and sort by points
    const sortedRanking = Object.values(rankingData).sort((a, b) => b.points - a.points);
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
      // Create matches for all participants
      const newMatches: Match[] = [];
      const now = new Date();
      
      for (let i = 0; i < tournament.participants.length; i++) {
        for (let j = i + 1; j < tournament.participants.length; j++) {
          // Verificar se a partida já existe
          const matchExists = tournament.matches.some(
            match => 
              (match.participant1Id === tournament.participants[i] && 
               match.participant2Id === tournament.participants[j]) ||
              (match.participant1Id === tournament.participants[j] && 
               match.participant2Id === tournament.participants[i])
          );
          
          if (!matchExists) {
            newMatches.push({
              id: Date.now() + Math.floor(Math.random() * 1000) + i + j, // Temporary ID
              tournamentId: tournament.id!,
              participant1Id: tournament.participants[i],
              participant2Id: tournament.participants[j],
              createdAt: now,
              updatedAt: now
            });
          }
        }
      }
      
      if (newMatches.length === 0) {
        alert("Todas as partidas possíveis já foram geradas");
        return;
      }
      
      // Update tournament with new matches and status
      const result = await tournamentsCrud.update(tournament.id!, {
        matches: [...tournament.matches, ...newMatches],
        status: TournamentStatus.IN_PROGRESS
      });
      
      if (result) {
        alert(`${newMatches.length} partidas geradas com sucesso!`);
        loadTournament();
      } else {
        alert("Erro ao gerar partidas");
      }
    } catch (error) {
      console.error("Erro ao gerar partidas:", error);
      alert("Erro ao gerar partidas");
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

  if (isLoading) {
    return <div className="text-center py-8">Carregando torneio...</div>;
  }

  if (!tournament) {
    return <div className="text-center py-8">Torneio não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{tournament.name}</h1>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline">
              {tournament.type === TournamentType.PLAYERS ? "Jogadores" : "Times"}
            </Badge>
            <Badge variant={tournament.status === TournamentStatus.CREATED 
              ? "secondary" 
              : tournament.status === TournamentStatus.IN_PROGRESS 
                ? "default" 
                : "outline"}>
              {tournament.status === TournamentStatus.CREATED ? "Criado" : 
               tournament.status === TournamentStatus.IN_PROGRESS ? "Em Andamento" : "Finalizado"}
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline"
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
                <CardTitle className="flex items-center">
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
                      {ranking.map((item, index) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-2 rounded-md bg-muted/20"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant={index < 3 ? "default" : "outline"} className="w-6 h-6 flex items-center justify-center p-0">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-muted-foreground">V</span>
                              <span>{item.wins}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-muted-foreground">E</span>
                              <span>{item.draws}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-muted-foreground">D</span>
                              <span>{item.losses}</span>
                            </div>
                            <div className="flex flex-col items-center font-bold ml-2">
                              <span className="text-xs text-muted-foreground">PTS</span>
                              <span>{item.points}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/20">
                    <span>Total de Participantes</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{participants.length}</span>
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/20">
                    <span>Total de Partidas</span>
                    <span className="font-medium">{matches.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/20">
                    <span>Partidas Realizadas</span>
                    <span className="font-medium">
                      {matches.filter(m => m.participant1Score !== undefined).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/20">
                    <span>Partidas Pendentes</span>
                    <span className="font-medium">
                      {matches.filter(m => m.participant1Score === undefined).length}
                    </span>
                  </div>
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
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
    </div>
  );
};

export default TournamentDetails; 