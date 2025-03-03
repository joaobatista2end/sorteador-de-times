import { Link } from "react-router-dom";
import coverImage from "../assets/cover1.jpg";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="relative overflow-hidden rounded-lg shadow-lg mb-10" 
           style={{
             backgroundImage: `url(${coverImage})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center'
           }}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-black/40"></div>
        <div className="relative z-10 px-6 py-16 md:py-24 md:px-12 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gerenciador de Torneios</h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl">
            Organize competições, gerencie jogadores e times, e acompanhe resultados em tempo real.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="outline" className="bg-black/80" asChild>
              <Link to="/tournaments">Ver Torneios</Link>
            </Button>
            <Button size="lg" variant="default" asChild >
              <Link to="/tournaments/create">Criar Torneio</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <CardTitle>Jogadores</CardTitle>
            </div>
            <CardDescription>
              Gerencie jogadores
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground">Cadastre, edite e remova jogadores para participarem dos torneios.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/players">Gerenciar Jogadores</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <CardTitle>Times</CardTitle>
            </div>
            <CardDescription>
              Gerencie equipes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground">Crie e gerencie times, adicionando jogadores às equipes para competições.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/teams">Gerenciar Times</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
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