import { CalendarIcon, Edit, Trash, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Breadcrumb } from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
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
      <Breadcrumb segments={[{ name: "Jogadores" }]} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Jogadores</h1>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <Input
            placeholder="Nome do jogador"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
          Adicionar Jogador
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Carregando jogadores...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Nenhum jogador cadastrado</p>
            </div>
          ) : (
            players.map((player) => (
              <Card key={player.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate">{player.name}</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>#{player.id}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    <span>Criado em {new Date(player.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(player)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(player)}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
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