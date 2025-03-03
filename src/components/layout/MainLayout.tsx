import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow sticky top-0 z-50">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-lg font-bold">
              Gerenciador de Torneios
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/players" className="hover:text-primary-foreground/80">
                Jogadores
              </Link>
              <Link to="/teams" className="hover:text-primary-foreground/80">
                Times
              </Link>
              <Link to="/tournaments" className="hover:text-primary-foreground/80">
                Torneios
              </Link>
              <ThemeToggle />
            </div>
            <div className="md:hidden flex items-center">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="ml-2 text-primary-foreground"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto p-4">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Fechar menu</span>
              </Button>
            </div>
            <nav className="flex flex-col items-center space-y-4 mt-8">
              <Link
                to="/"
                className="text-xl font-medium"
                onClick={toggleMobileMenu}
              >
                Home
              </Link>
              <Link
                to="/players"
                className="text-xl font-medium"
                onClick={toggleMobileMenu}
              >
                Jogadores
              </Link>
              <Link
                to="/teams"
                className="text-xl font-medium"
                onClick={toggleMobileMenu}
              >
                Times
              </Link>
              <Link
                to="/tournaments"
                className="text-xl font-medium"
                onClick={toggleMobileMenu}
              >
                Torneios
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>Gerenciador de Torneios &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 