import { Link, Outlet } from "react-router-dom";
import { Button } from "../ui/button";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-lg font-bold">
              Gerenciador de Torneios
            </Link>
            <nav className="flex space-x-2">
              <Button asChild variant="ghost">
                <Link to="/players">Jogadores</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/teams">Times</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/tournaments">Torneios</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-muted py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          Gerenciador de Torneios © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 