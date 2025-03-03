import { Trophy, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

const Home = () => {
  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/80 via-primary to-primary-foreground/20 p-8 md:p-12">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Gerenciador de Torneios</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Organize competições, gerencie times e jogadores, e acompanhe resultados em tempo real.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90">
              <Link to="/tournaments">Ver Torneios</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
              <Link to="/tournaments/create">Criar Torneio</Link>
            </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-background to-muted/50 border-primary/20 hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Jogadores</CardTitle>
            </div>
            <CardDescription>
              Gerencie os participantes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground">Cadastre jogadores para participar dos seus torneios individuais.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/players">Gerenciar Jogadores</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/50 border-primary/20 hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Times</CardTitle>
            </div>
            <CardDescription>
              Organize equipes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground">Crie e gerencie times para participar dos seus torneios em equipe.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/teams">Gerenciar Times</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/50 border-primary/20 hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Torneios</CardTitle>
            </div>
            <CardDescription>
              Crie competições
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground">Organize torneios, gere partidas e acompanhe os resultados.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/tournaments">Gerenciar Torneios</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Home; 