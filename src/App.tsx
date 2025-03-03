import { Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import CreateTournament from "./pages/CreateTournament";
import Home from "./pages/Home";
import Players from "./pages/Players";
import Teams from "./pages/Teams";
import TournamentDetails from "./pages/TournamentDetails";
import Tournaments from "./pages/Tournaments";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="players" element={<Players />} />
        <Route path="teams" element={<Teams />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="tournaments/create" element={<CreateTournament />} />
        <Route path="tournaments/:id" element={<TournamentDetails />} />
      </Route>
    </Routes>
  );
}
