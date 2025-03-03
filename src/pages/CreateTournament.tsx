import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Player, Team, Tournament, TournamentStatus, TournamentType, playersCrud, teamsCrud, tournamentsCrud } from "../lib/db";

type TournamentForm = {
  name: string;
  type: TournamentType;
  participants: number[];
};

const CreateTournament = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedType, setSelectedType] = useState<TournamentType | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  
  const form = useForm<TournamentForm>({
    defaultValues: {
      name: "",
      type: TournamentType.PLAYERS,
      participants: []
    }
  });

  useEffect(() => {
    // Load players and teams when component mounts
    const loadData = async () => {
      try {
        const allPlayers = await playersCrud.getAll();
        const allTeams = await teamsCrud.getAll();
        setPlayers(allPlayers);
        setTeams(allTeams);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    
    loadData();
  }, []);

  const onSubmit = async (data: TournamentForm) => {
    try {
      const newTournament: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name,
        type: data.type,
        participants: selectedParticipants,
        matches: [],
        status: TournamentStatus.CREATED
      };
      
      await tournamentsCrud.add(newTournament);
      navigate("/tournaments");
    } catch (error) {
      console.error("Erro ao criar torneio:", error);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      const name = form.getValues("name");
      if (!name.trim()) {
        form.setError("name", { message: "O nome do torneio é obrigatório" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedType) {
        alert("Selecione um tipo de torneio");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedParticipants.length < 2) {
        alert("Selecione pelo menos 2 participantes");
        return;
      }
      setStep(4);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleParticipant = (id: number) => {
    setSelectedParticipants(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Criar Novo Torneio</h1>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Passo 1: Informações Básicas"}
            {step === 2 && "Passo 2: Tipo de Torneio"}
            {step === 3 && "Passo 3: Selecionar Participantes"}
            {step === 4 && "Passo 4: Confirmar e Criar"}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Step indicators */}
          <div className="flex mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 ${
                  s <= step ? "bg-primary" : "bg-muted"
                } ${s > 1 ? "ml-1" : ""}`}
              />
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Torneio</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do torneio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 2: Tournament Type */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Escolha o tipo de torneio que deseja criar.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer border-2 ${selectedType === TournamentType.PLAYERS ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => {
                        setSelectedType(TournamentType.PLAYERS);
                        form.setValue("type", TournamentType.PLAYERS);
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-center">Torneio de Jogadores</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center text-muted-foreground">
                          Torneio entre jogadores individuais
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className={`cursor-pointer border-2 ${selectedType === TournamentType.TEAMS ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => {
                        setSelectedType(TournamentType.TEAMS);
                        form.setValue("type", TournamentType.TEAMS);
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-center">Torneio de Times</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center text-muted-foreground">
                          Torneio entre times
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Step 3: Select Participants */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecione os {selectedType === TournamentType.PLAYERS ? 'jogadores' : 'times'} que participarão do torneio.
                  </p>
                  
                  {selectedType === TournamentType.PLAYERS && (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Nome</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {players.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center">
                                Nenhum jogador cadastrado
                              </TableCell>
                            </TableRow>
                          ) : (
                            players.map((player) => (
                              <TableRow
                                key={player.id}
                                className={selectedParticipants.includes(player.id!) ? "bg-muted" : ""}
                                onClick={() => toggleParticipant(player.id!)}
                              >
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    checked={selectedParticipants.includes(player.id!)}
                                    onChange={() => {}}
                                    className="h-4 w-4"
                                  />
                                </TableCell>
                                <TableCell>{player.name}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {selectedType === TournamentType.TEAMS && (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Jogadores</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teams.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center">
                                Nenhum time cadastrado
                              </TableCell>
                            </TableRow>
                          ) : (
                            teams.map((team) => (
                              <TableRow
                                key={team.id}
                                className={selectedParticipants.includes(team.id!) ? "bg-muted" : ""}
                                onClick={() => toggleParticipant(team.id!)}
                              >
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    checked={selectedParticipants.includes(team.id!)}
                                    onChange={() => {}}
                                    className="h-4 w-4"
                                  />
                                </TableCell>
                                <TableCell>{team.name}</TableCell>
                                <TableCell>{team.players.length} jogadores</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <p className="text-sm">
                    {selectedParticipants.length} participantes selecionados
                  </p>
                </div>
              )}

              {/* Step 4: Confirm */}
              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Revise as informações do torneio antes de criar.
                  </p>
                  
                  <div className="rounded-md border p-4 space-y-3">
                    <div>
                      <span className="font-medium">Nome do Torneio:</span>{" "}
                      {form.getValues("name")}
                    </div>
                    <div>
                      <span className="font-medium">Tipo de Torneio:</span>{" "}
                      {form.getValues("type") === TournamentType.PLAYERS ? "Jogadores" : "Times"}
                    </div>
                    <div>
                      <span className="font-medium">Número de Participantes:</span>{" "}
                      {selectedParticipants.length}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Ao clicar em "Criar Torneio", você estará finalizando a criação
                    e poderá gerenciar as partidas na página de torneios.
                  </p>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Voltar
            </Button>
          )}
          
          {step < 4 ? (
            <Button onClick={nextStep} className={step === 1 ? "ml-auto" : ""}>
              Próximo
            </Button>
          ) : (
            <Button onClick={form.handleSubmit(onSubmit)}>
              Criar Torneio
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateTournament; 