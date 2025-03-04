import { CalendarIcon, Edit, Trash, Users, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Breadcrumb } from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Player, Team, playersCrud, teamsCrud } from "../lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

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
  const [searchPlayerQuery, setSearchPlayerQuery] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);

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

  const openAddPlayerDialog = async (team: Team) => {
    try {
      // Obter os dados mais recentes do time do banco de dados
      const freshTeam = await teamsCrud.getById(team.id!);
      if (freshTeam) {
        setSelectedTeam(freshTeam);
        loadTeamPlayers(freshTeam);
      } else {
        setSelectedTeam({...team}); // Fallback para o time passado como parâmetro
        loadTeamPlayers(team);
      }
      setSelectedPlayerId("");
      setIsAddPlayerDialogOpen(true);
    } catch (error) {
      console.error("Erro ao abrir diálogo de jogadores:", error);
      // Fallback para o time passado como parâmetro
      setSelectedTeam({...team});
      loadTeamPlayers(team);
      setSelectedPlayerId("");
      setIsAddPlayerDialogOpen(true);
    }
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

  const handleCreatePlayerInTeam = async () => {
    if (!newPlayerName.trim() || !selectedTeam) return;
    
    try {
      // Desabilitar o botão durante a operação
      setIsCreatingPlayer(true);
      
      console.log("Criando jogador com nome:", newPlayerName);
      
      // Criar o jogador com dados mais completos
      const newPlayer = await playersCrud.add({ 
        name: newPlayerName,
        createdAt: new Date().toISOString()
      });
      
      console.log("Resposta da criação do jogador:", newPlayer);
      
      // Verificar se o jogador foi criado corretamente
      if (!newPlayer) {
        console.error("Falha ao criar jogador: Nenhum dado retornado");
        alert("Erro ao criar jogador. Tente novamente.");
        return;
      }
      
      // Se o ID não for definido, tente obter o jogador recém-criado pelo nome
      if (!newPlayer.id) {
        console.warn("Jogador criado sem ID, tentando buscar por nome...");
        const allPlayers = await playersCrud.getAll();
        const createdPlayer = allPlayers.find(p => p.name === newPlayerName);
        
        if (createdPlayer && createdPlayer.id) {
          console.log("Jogador encontrado pelo nome:", createdPlayer);
          
          // Usar o jogador encontrado
          const updatedPlayers = [...selectedTeam.players, createdPlayer.id];
          
          // Atualizar o time com o jogador
          await teamsCrud.update(selectedTeam.id!, {
            ...selectedTeam,
            players: updatedPlayers
          });
          
          // Atualizar a interface
          setNewPlayerName("");
          setSelectedTeam({...selectedTeam, players: updatedPlayers});
          setTeamPlayers(current => [...current, createdPlayer]);
          
          // Recarregar os dados
          await loadPlayers();
          await loadTeams();
          
          return;
        } else {
          console.error("Não foi possível encontrar o jogador criado");
          alert("Jogador criado, mas não foi possível adicioná-lo ao time automaticamente.");
          return;
        }
      }
      
      // Continuar com o fluxo normal se o ID existir
      setNewPlayerName("");
      
      console.log("Atualizando time com novo jogador ID:", newPlayer.id);
      
      // Atualizar o time com o novo jogador
      const updatedPlayers = [...selectedTeam.players, newPlayer.id];
      
      await teamsCrud.update(selectedTeam.id!, {
        ...selectedTeam,
        players: updatedPlayers
      });
      
      // Atualizar a interface
      setSelectedTeam({...selectedTeam, players: updatedPlayers});
      setTeamPlayers(current => [...current, newPlayer]);
      
      // Recarregar os dados
      await loadPlayers();
      await loadTeams();
      
    } catch (error) {
      console.error("Erro detalhado ao criar jogador:", error);
      alert("Erro ao criar jogador. Detalhes no console.");
    } finally {
      setIsCreatingPlayer(false);
    }
  };

  const handleAddPlayerToTeam = async (playerId: string) => {
    if (!selectedTeam || !playerId) return;
    
    try {
      const playerIdNum = parseInt(playerId);
      
      // Verificar se o jogador já está no time
      if (selectedTeam.players.includes(playerIdNum)) {
        console.log("Jogador já está no time");
        return;
      }
      
      // Encontrar o jogador na lista atual para atualização imediata da UI
      const playerToAdd = players.find(p => p.id === playerIdNum);
      if (!playerToAdd) {
        console.error("Jogador não encontrado");
        return;
      }
      
      // Atualizar time com novo jogador
      const updatedPlayers = [...selectedTeam.players, playerIdNum];
      
      const updatedTeam = {
        ...selectedTeam,
        players: updatedPlayers
      };
      
      // Salvar no banco de dados
      await teamsCrud.update(selectedTeam.id!, updatedTeam);
      
      // Atualizar estado local de forma imediata
      setSelectedTeam(updatedTeam);
      setTeamPlayers(current => [...current, playerToAdd]);
      
      // Forçar atualização da lista de jogadores disponíveis
      setPlayers(current => {
        // Criar uma nova lista, forçando renderização
        return [...current]; 
      });
      
      // Atualizar os dados do banco
      await loadTeams();
      await loadPlayers();
    } catch (error) {
      console.error("Erro ao adicionar jogador ao time:", error);
      alert("Erro ao adicionar jogador. Tente novamente.");
    }
  };

  const handleRemovePlayerFromTeam = async (playerId: number) => {
    if (!selectedTeam) return;
    
    try {
      // Remover jogador do time
      const success = await teamsCrud.removePlayerFromTeam(selectedTeam.id!, playerId);
      
      if (success) {
        // Recarregar os dados do time e dos jogadores
        const updatedTeam = await teamsCrud.getById(selectedTeam.id!);
        if (updatedTeam) {
          setSelectedTeam(updatedTeam);
          loadTeamPlayers(updatedTeam);
        }
        
        // Recarregar a lista de times para atualizar a contagem de jogadores na tabela principal
        loadTeams();
      } else {
        console.error("Falha ao remover jogador do time");
      }
    } catch (error) {
      console.error("Erro ao remover jogador do time:", error);
    }
  };

  // Modificar o método getAvailablePlayers para ser mais confiável
  const getAvailablePlayers = () => {
    if (!selectedTeam) return [];
    
    // Verificar quais jogadores não estão em nenhum time ou já estão no time selecionado
    return players.filter(player => {
      // Verificar se o jogador já está no time atual
      if (selectedTeam.players.includes(player.id!)) {
        return false;
      }
      
      // Verificar se o jogador está em algum outro time
      for (const team of teams) {
        if (team.id !== selectedTeam.id && team.players.includes(player.id!)) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Jogadores disponíveis (que não estão em nenhum time)
  const availablePlayers = getAvailablePlayers();
  
  // Filtramos com base na busca
  const filteredAvailablePlayers = availablePlayers.filter(player => 
    player.name.toLowerCase().includes(searchPlayerQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumb segments={[{ name: "Times" }]} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Times</h1>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <Input
            placeholder="Nome do time"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handleAddTeam} disabled={!newTeamName.trim()}>
          Adicionar Time
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Carregando times...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Nenhum time cadastrado</p>
            </div>
          ) : (
            teams.map((team) => (
              <Card key={team.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate">{team.name}</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{team.players.length}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    <span>Criado em {new Date(team.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAddPlayerDialog(team)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Jogadores
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(team)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(team)}
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
          if (!open) {
            setSelectedTeam(null);
            setTeamPlayers([]);
            setSearchPlayerQuery("");
            setNewPlayerName("");
            setIsCreatingPlayer(false);
            // Recarregar a lista de times ao fechar o diálogo
            loadTeams();
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Jogadores do Time: {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Adicione ou remova jogadores deste time.
            </DialogDescription>
          </DialogHeader>
          
          {/* Layout modificado para horizontal em vez de vertical */}
          <div className="space-y-6 py-4">
            {/* Seção de adicionar jogadores */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Jogador</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="existing">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="existing">Jogadores Existentes</TabsTrigger>
                    <TabsTrigger value="new">Novo Jogador</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="existing">
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar jogadores..."
                          className="pl-8"
                          value={searchPlayerQuery}
                          onChange={(e) => setSearchPlayerQuery(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                        {filteredAvailablePlayers.length === 0 ? (
                          <div className="col-span-full text-center text-muted-foreground py-4">
                            Nenhum jogador disponível
                          </div>
                        ) : (
                          filteredAvailablePlayers.map((player) => (
                            <div 
                              key={player.id} 
                              className="flex justify-between items-center p-2 bg-muted/20 rounded-md"
                            >
                              <span className="truncate">{player.name}</span>
                              <Button
                                size="sm"
                                onClick={() => handleAddPlayerToTeam(player.id!.toString())}
                              >
                                Adicionar
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="new">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome do novo jogador"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                      />
                      <Button 
                        onClick={handleCreatePlayerInTeam}
                        disabled={!newPlayerName.trim()}
                      >
                        Criar e Adicionar
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Seção de jogadores do time */}
            <Card>
              <CardHeader>
                <CardTitle>Jogadores do Time</CardTitle>
              </CardHeader>
              <CardContent>
                {teamPlayers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    Este time não possui jogadores
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
                    {teamPlayers.map((player) => (
                      <div 
                        key={player.id} 
                        className="flex justify-between items-center p-2 bg-muted/20 rounded-md"
                      >
                        <span className="truncate">{player.name}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemovePlayerFromTeam(player.id!)}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                // Recarregar a lista de times antes de fechar o diálogo
                loadTeams();
                setIsAddPlayerDialogOpen(false);
              }}
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