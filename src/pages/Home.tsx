import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

const Home = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Bem-vindo ao Gerenciador de Torneios</h1>
        <p className="text-xl text-muted-foreground">
          Gerencie jogadores, times e organize torneios de forma simples e eficiente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jogadores</CardTitle>
            <CardDescription>
              Cadastre e gerencie jogadores que participarão dos torneios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>Adicione jogadores</li>
              <li>Edite informações</li>
              <li>Remova jogadores</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/players">Gerenciar Jogadores</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Times</CardTitle>
            <CardDescription>
              Crie times e adicione jogadores para competir em torneios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>Crie times</li>
              <li>Adicione jogadores aos times</li>
              <li>Organize equipes para torneios</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/teams">Gerenciar Times</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Torneios</CardTitle>
            <CardDescription>
              Crie e gerencie torneios de times ou jogadores individuais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>Crie torneios</li>
              <li>Gere confrontos automaticamente</li>
              <li>Acompanhe resultados em tempo real</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/tournaments">Gerenciar Torneios</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-8">
        <Button asChild size="lg">
          <Link to="/tournaments/new">Criar Novo Torneio</Link>
        </Button>
      </div>
    </div>
  );
};

export default Home; 