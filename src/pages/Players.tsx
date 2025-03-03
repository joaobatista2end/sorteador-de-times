import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Player, playersCrud } from "../lib/db";

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [editPlayerName, setEditPlayerName] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const allPlayers = await playersCrud.getAll();
      setPlayers(allPlayers);
    } catch (error) {
      console.error("Erro ao carregar jogadores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    
    try {
      await playersCrud.add({ name: newPlayerName });
      setNewPlayerName("");
      loadPlayers();
    } catch (error) {
      console.error("Erro ao adicionar jogador:", error);
    }
  };

  const openEditDialog = (player: Player) => {
    setPlayerToEdit(player);
    setEditPlayerName(player.name);
    setIsEditDialogOpen(true);
  };

  const handleEditPlayer = async () => {
    if (!playerToEdit || !editPlayerName.trim()) return;
    
    try {
      await playersCrud.update(playerToEdit.id!, { name: editPlayerName });
      setIsEditDialogOpen(false);
      loadPlayers();
    } catch (error) {
      console.error("Erro ao editar jogador:", error);
    }
  };

  const openDeleteDialog = (player: Player) => {
    setPlayerToDelete(player);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    
    try {
      await playersCrud.remove(playerToDelete.id!);
      setIsDeleteDialogOpen(false);
      loadPlayers();
    } catch (error) {
      console.error("Erro ao remover jogador:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Jogadores</h1>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Nome do jogador"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
          Adicionar Jogador
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Carregando jogadores...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhum jogador cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.id}</TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>
                      {new Date(player.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(player)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(player)}
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

      {/* Edit Player Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Jogador</DialogTitle>
            <DialogDescription>
              Atualize as informações do jogador abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editPlayerName}
              onChange={(e) => setEditPlayerName(e.target.value)}
              placeholder="Nome do jogador"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditPlayer} disabled={!editPlayerName.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Player Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o jogador "{playerToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeletePlayer}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Players; 