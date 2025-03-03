import { Check, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Breadcrumb } from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Switch } from "../components/ui/switch";
import { Player, Team, Tournament, TournamentFormat, TournamentStatus, TournamentType, playersCrud, teamsCrud, tournamentsCrud } from "../lib/db";

type TournamentForm = {
  name: string;
  type: TournamentType;
  format: TournamentFormat;
  participants: number[];
};

const CreateTournament = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [availableParticipants, setAvailableParticipants] = useState<(Player | Team)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<TournamentForm>({
    defaultValues: {
      name: "",
      type: TournamentType.PLAYERS,
      format: TournamentFormat.BEST_OF_3,
      participants: [],
    },
  });

  const tournamentType = form.watch("type");

  useEffect(() => {
    loadData();
  }, [tournamentType]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (tournamentType === TournamentType.PLAYERS) {
        const players = await playersCrud.getAll();
        setAvailableParticipants(players);
      } else {
        const teams = await teamsCrud.getAll();
        setAvailableParticipants(teams);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TournamentForm) => {
    try {
      const newTournament: Tournament = {
        name: data.name,
        type: data.type,
        format: data.format,
        participants: data.participants,
        matches: [],
        status: TournamentStatus.CREATED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tournamentId = await tournamentsCrud.add(newTournament);
      if (tournamentId) {
        navigate(`/tournaments/${tournamentId}`);
      } else {
        alert("Erro ao criar torneio");
      }
    } catch (error) {
      console.error("Erro ao criar torneio:", error);
      alert("Erro ao criar torneio");
    }
  };

  const nextStep = () => {
    const currentValues = form.getValues();
    
    if (step === 1) {
      // Validar nome do torneio
      if (!currentValues.name.trim()) {
        form.setError("name", { 
          type: "required", 
          message: "O nome do torneio é obrigatório" 
        });
        return;
      }
    } else if (step === 2) {
      // Validar participantes
      if (currentValues.participants.length < 2) {
        alert("Selecione pelo menos 2 participantes para o torneio");
        return;
      }
    }
    
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleParticipant = (id: number) => {
    const currentParticipants = form.watch("participants");
    const isSelected = currentParticipants.includes(id);
    
    if (isSelected) {
      form.setValue(
        "participants",
        currentParticipants.filter((participantId) => participantId !== id),
        { shouldValidate: true, shouldDirty: true }
      );
    } else {
      form.setValue(
        "participants", 
        [...currentParticipants, id],
        { shouldValidate: true, shouldDirty: true }
      );
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb 
        segments={[
          { name: "Torneios", href: "/tournaments" },
          { name: "Criar Torneio" }
        ]} 
      />
      
      <h1 className="text-3xl font-bold">Criar Torneio</h1>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Passo 1: Informações Básicas"}
            {step === 2 && "Passo 2: Selecionar Participantes"}
            {step === 3 && "Passo 3: Confirmar Criação"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-3 inline-block">Nome do Torneio</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome do torneio" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Torneio de Times?</FormLabel>
                          <FormDescription>
                            Marque para criar um torneio de times.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === TournamentType.TEAMS}
                            onCheckedChange={(checked: boolean) => 
                              field.onChange(checked ? TournamentType.TEAMS : TournamentType.PLAYERS)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("type") === TournamentType.TEAMS && (
                    <FormField
                      control={form.control}
                      name="format"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">O Torneio é melhor de 5?</FormLabel>
                            <FormDescription>
                              Por padrão, o torneio é melhor de 3. Marque para criar um torneio melhor de 5.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === TournamentFormat.BEST_OF_5}
                              onCheckedChange={(checked: boolean) => 
                                field.onChange(checked ? TournamentFormat.BEST_OF_5 : TournamentFormat.BEST_OF_3)
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-lg font-medium">
                      Selecione os {tournamentType === TournamentType.PLAYERS ? "jogadores" : "times"} para o torneio
                    </h3>
                    
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={`Buscar ${tournamentType === TournamentType.PLAYERS ? "jogadores" : "times"}...`}
                        className="pl-8"
                        onChange={(e) => {
                          const searchTerm = e.target.value.toLowerCase();
                          if (searchTerm === "") {
                            loadData();
                          } else {
                            setAvailableParticipants(
                              availableParticipants.filter(p => 
                                p.name.toLowerCase().includes(searchTerm)
                              )
                            );
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      {availableParticipants.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-muted/20">
                          <p className="text-muted-foreground">
                            Nenhum {tournamentType === TournamentType.PLAYERS ? "jogador" : "time"} disponível
                          </p>
                          <Button 
                            variant="link" 
                            onClick={() => navigate(tournamentType === TournamentType.PLAYERS ? "/players" : "/teams")}
                            className="mt-2"
                          >
                            Criar {tournamentType === TournamentType.PLAYERS ? "jogadores" : "times"}
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] rounded-md border">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                            {availableParticipants.map((participant) => {
                              const isSelected = form.watch("participants").includes(participant.id!);
                              return (
                                <Card 
                                  key={participant.id}
                                  className={`cursor-pointer transition-all hover:border-primary ${
                                    isSelected ? "border-primary bg-primary/5" : ""
                                  }`}
                                  onClick={() => toggleParticipant(participant.id!)}
                                >
                                  <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                                    <CardTitle className="text-base truncate max-w-[80%]">{participant.name}</CardTitle>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                      isSelected 
                                        ? "bg-primary border-primary text-primary-foreground" 
                                        : "border-muted-foreground"
                                    }`}>
                                      {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                  </CardHeader>
                                  <CardContent className="px-4 pb-4 pt-0">
                                    <div className="text-sm text-muted-foreground">
                                      Criado em {new Date(participant.createdAt).toLocaleDateString()}
                                    </div>
                                    {tournamentType === TournamentType.TEAMS && 'players' in participant && (
                                      <Badge variant="outline" className="mt-2">
                                        {participant.players?.length || 0} jogadores
                                      </Badge>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                    </>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm">
                      <span className="font-medium">{form.watch("participants").length}</span> {form.watch("participants").length === 1 ? "participante" : "participantes"} selecionado{form.watch("participants").length !== 1 ? "s" : ""}
                    </div>
                    
                    {form.watch("participants").length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => form.setValue("participants", [], { shouldValidate: true, shouldDirty: true })}
                      >
                        Limpar seleção
                      </Button>
                    )}
                  </div>

                  {form.watch("participants").length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Participantes selecionados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("participants").map((participantId) => {
                          const participant = availableParticipants.find(p => p.id === participantId);
                          if (!participant) return null;
                          
                          return (
                            <Badge 
                              key={participantId} 
                              variant="secondary"
                              className="flex items-center gap-1 py-1.5 pl-3 pr-2"
                            >
                              {participant.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleParticipant(participantId);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Informações do Torneio</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Nome:</span> {form.getValues("name")}
                        </div>
                        <div>
                          <span className="font-medium">Tipo:</span> {form.getValues("type") === TournamentType.PLAYERS ? "Jogadores" : "Times"}
                        </div>
                        {form.getValues("type") === TournamentType.TEAMS && (
                          <div>
                            <span className="font-medium">Formato:</span> {form.getValues("format") === TournamentFormat.BEST_OF_3 ? "Melhor de 3" : "Melhor de 5"}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Participantes:</span> {form.getValues("participants").length}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm">
                      Ao criar o torneio, você poderá gerenciar as partidas e acompanhar os resultados na página de detalhes do torneio.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Voltar
            </Button>
          ) : (
            <div></div>
          )}
          
          {step < 3 ? (
            <Button onClick={nextStep}>
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