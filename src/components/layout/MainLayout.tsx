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
      <header className="bg-primary text-primary-foreground shadow sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-lg font-bold">
              Gerenciador de Torneios
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link to="/players">Jogadores</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/teams">Times</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/tournaments">Torneios</Link>
              </Button>
              <ThemeToggle />
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 flex flex-col space-y-2">
              <Button 
                asChild 
                variant="ghost" 
                className="justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/players">Jogadores</Link>
              </Button>
              <Button 
                asChild 
                variant="ghost" 
                className="justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/teams">Times</Link>
              </Button>
              <Button 
                asChild 
                variant="ghost" 
                className="justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/tournaments">Torneios</Link>
              </Button>
            </nav>
          )}
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-muted py-4 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          Gerenciador de Torneios © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 