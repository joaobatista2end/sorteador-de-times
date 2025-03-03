import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
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
                        onClick={() => {}}
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
    </div>
  );
};

export default Teams; 