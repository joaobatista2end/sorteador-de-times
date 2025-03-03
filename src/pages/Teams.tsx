import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Player, Team, playersCrud, teamsCrud } from "../lib/db";

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadTeams();
    loadPlayers();
  }, []);

  const loadTeams = async () => {
    setIsLoading(true);
    try {
      const allTeams = await teamsCrud.getAll();
      setTeams(allTeams);
    } catch (error) {
      console.error("Erro ao carregar times:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlayers = async () => {
    try {
      const allPlayers = await playersCrud.getAll();
      setPlayers(allPlayers);
    } catch (error) {
      console.error("Erro ao carregar jogadores:", error);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    
    try {
      await teamsCrud.add({ name: newTeamName, players: [] });
      setNewTeamName("");
      loadTeams();
    } catch (error) {
      console.error("Erro ao adicionar time:", error);
    }
  };

  const openEditDialog = (team: Team) => {
    setTeamToEdit(team);
    setEditTeamName(team.name);
    setIsEditDialogOpen(true);
  };

  const handleEditTeam = async () => {
    if (!teamToEdit || !editTeamName.trim()) return;
    
    try {
      await teamsCrud.update(teamToEdit.id!, { name: editTeamName });
      setIsEditDialogOpen(false);
      loadTeams();
    } catch (error) {
      console.error("Erro ao editar time:", error);
    }
  };

  const openDeleteDialog = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    
    try {
      await teamsCrud.remove(teamToDelete.id!);
      setIsDeleteDialogOpen(false);
      loadTeams();
    } catch (error) {
      console.error("Erro ao remover time:", error);
    }
  };

  const openAddPlayerDialog = (team: Team) => {
    setSelectedTeam(team);
    loadTeamPlayers(team);
    setSelectedPlayerId("");
    setIsAddPlayerDialogOpen(true);
  };

  const loadTeamPlayers = async (team: Team) => {
    try {
      const teamPlayersData = await Promise.all(
        team.players.map(async (playerId) => {
          return await playersCrud.getById(playerId as number);
        })
      );
      
      // Filter out undefined values (in case a player doesn't exist anymore)
      setTeamPlayers(teamPlayersData.filter(Boolean) as Player[]);
    } catch (error) {
      console.error("Erro ao carregar jogadores do time:", error);
    }
  };

  const handleAddPlayerToTeam = async () => {
    if (!selectedTeam || !selectedPlayerId) return;
    
    try {
      await teamsCrud.addPlayerToTeam(selectedTeam.id!, parseInt(selectedPlayerId));
      loadTeams();
      loadTeamPlayers(selectedTeam);
      setSelectedPlayerId("");
    } catch (error) {
      console.error("Erro ao adicionar jogador ao time:", error);
    }
  };

  const handleRemovePlayerFromTeam = async (playerId: number) => {
    if (!selectedTeam) return;
    
    try {
      await teamsCrud.removePlayerFromTeam(selectedTeam.id!, playerId);
      loadTeams();
      loadTeamPlayers(selectedTeam);
    } catch (error) {
      console.error("Erro ao remover jogador do time:", error);
    }
  };

  const availablePlayers = players.filter((player) => 
    !selectedTeam?.players.includes(player.id!)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Times</h1>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Nome do time"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddTeam} disabled={!newTeamName.trim()}>
          Adicionar Time
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Carregando times...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Jogadores</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum time cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>{team.id}</TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.players.length} jogadores</TableCell>
                    <TableCell>
                      {new Date(team.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddPlayerDialog(team)}
                      >
                        Jogadores
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(team)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(team)}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Time</DialogTitle>
            <DialogDescription>
              Atualize as informações do time abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editTeamName}
              onChange={(e) => setEditTeamName(e.target.value)}
              placeholder="Nome do time"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditTeam} disabled={!editTeamName.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o time "{teamToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Player to Team Dialog */}
      <Dialog 
        open={isAddPlayerDialogOpen} 
        onOpenChange={(open) => {
          setIsAddPlayerDialogOpen(open);
          if (!open) setSelectedTeam(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Jogadores do Time: {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Adicione ou remova jogadores deste time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Jogador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select 
                    value={selectedPlayerId} 
                    onValueChange={setSelectedPlayerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um jogador" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayers.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Nenhum jogador disponível
                        </SelectItem>
                      ) : (
                        availablePlayers.map((player) => (
                          <SelectItem 
                            key={player.id} 
                            value={player.id!.toString()}
                          >
                            {player.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAddPlayerToTeam}
                    disabled={!selectedPlayerId}
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jogadores do Time</CardTitle>
              </CardHeader>
              <CardContent>
                {teamPlayers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-2">
                    Este time não possui jogadores
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamPlayers.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>{player.name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemovePlayerFromTeam(player.id!)}
                            >
                              Remover
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddPlayerDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams; 