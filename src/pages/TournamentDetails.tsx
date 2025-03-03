import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <p className="text-muted-foreground">
            Torneio de {tournament.type === TournamentType.PLAYERS ? "Jogadores" : "Times"} • 
            {tournament.status === TournamentStatus.CREATED ? " Criado" : 
             tournament.status === TournamentStatus.IN_PROGRESS ? " Em Andamento" : " Finalizado"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Excluir Torneio
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pos.</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>V</TableHead>
                      <TableHead>E</TableHead>
                      <TableHead>D</TableHead>
                      <TableHead>Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ranking.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Nenhum resultado registrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      ranking.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.wins}</TableCell>
                          <TableCell>{item.draws}</TableCell>
                          <TableCell>{item.losses}</TableCell>
                          <TableCell className="font-bold">{item.points}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de Participantes:</span>
                    <span className="font-medium">{participants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Partidas:</span>
                    <span className="font-medium">{matches.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partidas Realizadas:</span>
                    <span className="font-medium">
                      {matches.filter(m => m.participant1Score !== undefined).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partidas Pendentes:</span>
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
              <Button onClick={generateMatches}>
                Gerar Partidas
              </Button>
            )}
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participante 1</TableHead>
                  <TableHead>Participante 2</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Nenhuma partida gerada
                    </TableCell>
                  </TableRow>
                ) : (
                  matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>{getParticipantName(match.participant1Id)}</TableCell>
                      <TableCell>{getParticipantName(match.participant2Id)}</TableCell>
                      <TableCell>
                        {match.participant1Score !== undefined && match.participant2Score !== undefined
                          ? `${match.participant1Score} x ${match.participant2Score}`
                          : "Não realizada"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMatchDialog(match)}
                        >
                          {match.participant1Score !== undefined ? "Editar" : "Registrar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Participantes</h2>
            {tournament.status === TournamentStatus.CREATED && (
              <Button onClick={() => setIsAddParticipantDialogOpen(true)}>
                Adicionar Participante
              </Button>
            )}
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  {tournament.type === TournamentType.TEAMS && (
                    <TableHead>Jogadores</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tournament.type === TournamentType.TEAMS ? 2 : 1} className="text-center">
                      Nenhum participante
                    </TableCell>
                  </TableRow>
                ) : (
                  participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      {tournament.type === TournamentType.TEAMS && (
                        <TableCell>
                          {(participant as Team).players?.length || 0} jogadores
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Tournament Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o torneio "{tournament.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTournament}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Match Result Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Resultado</DialogTitle>
            <DialogDescription>
              Informe o resultado da partida entre {currentMatch && getParticipantName(currentMatch.participant1Id)} e {currentMatch && getParticipantName(currentMatch.participant2Id)}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 items-center gap-4 py-4">
            <div className="text-center">
              <p className="mb-2">{currentMatch && getParticipantName(currentMatch.participant1Id)}</p>
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
              <p className="mb-2">{currentMatch && getParticipantName(currentMatch.participant2Id)}</p>
              <Input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                className="text-center"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMatchDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMatchResult}>
              Salvar Resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog open={isAddParticipantDialogOpen} onOpenChange={setIsAddParticipantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Participante</DialogTitle>
            <DialogDescription>
              Selecione um {tournament.type === TournamentType.PLAYERS ? "jogador" : "time"} para adicionar ao torneio.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        Nenhum {tournament.type === TournamentType.PLAYERS ? "jogador" : "time"} disponível
                      </TableCell>
                    </TableRow>
                  ) : (
                    availableParticipants.map((participant) => (
                      <TableRow
                        key={participant.id}
                        className={selectedParticipantId === participant.id?.toString() ? "bg-muted" : ""}
                        onClick={() => setSelectedParticipantId(participant.id?.toString() || "")}
                      >
                        <TableCell>
                          <input
                            type="radio"
                            checked={selectedParticipantId === participant.id?.toString()}
                            onChange={() => {}}
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell>{participant.name}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddParticipantDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddParticipant}
              disabled={!selectedParticipantId}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentDetails; 