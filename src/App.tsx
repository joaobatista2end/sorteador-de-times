import { useMemo, useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Table, TableBody, TableRow, TableCell, TableHeader, TableHead } from "./components/ui/table";
import { getTournament, Tournament } from "./lib/player-sort";

function PlayerForm({ player, setPlayer, addPlayer, playerIsValid }: { 
  player: string;
  setPlayer: (value: string) => void;
  addPlayer: () => void;
  playerIsValid: boolean;
}) {
  return (
    <div className="flex gap-x-4">
      <Input
        type="text"
        placeholder="Nome do Jogador"
        value={player}
        onChange={(e) => setPlayer(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && playerIsValid && addPlayer()}
      />
      <Button disabled={!playerIsValid} onClick={addPlayer}>
        Adicionar
      </Button>
    </div>
  );
}

function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`max-w-screen-sm mx-auto ${className ?? ""}`}>{children}</div>;
}

function PlayersTable({ players }: { players: string[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
           ID
          </TableHead>
          <TableHead>
            Nome do Jogador
          </TableHead>
        </TableRow>
      </TableHeader>
      
      <TableBody>
        {players.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2}>Nenhum jogador adicionado ainda.</TableCell>
          </TableRow>
        ) : (
          players.map((player, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{player}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function TournamentTable({ tournament }: { tournament: Tournament }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
           Jogador 1
          </TableHead>
          <TableHead>
            Jogador 2
          </TableHead>
          <TableHead>
            Resultado
          </TableHead>
          <TableHead>
            Pontos
          </TableHead>
        </TableRow>
      </TableHeader>
      
      <TableBody>
        {tournament.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4}>Nenhum jogador adicionado ainda.</TableCell>
          </TableRow>
        ) : (
          tournament.map((confrontation, index) => (
            <TableRow key={index}>
              <TableCell>{confrontation.players[0]}</TableCell>
              <TableCell>{confrontation.players[1]}</TableCell>
              <TableCell>{confrontation.result ?? '-'}</TableCell>
              <TableCell>{confrontation.scoreboard ?? '-'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default function App() {
  const [player, setPlayer] = useState("");
  const [players, setPlayers] = useState<Array<string>>([]);
  const [tournament, setTournament] = useState<Tournament>([]);

  const generateTournament = () => {
    setTournament(getTournament(players))
  }

  const addPlayer = () => {
    setPlayers([...players, player]);
    setPlayer("");
  };

  const playerIsValid = useMemo(() => {
    if (!players?.length && !!player?.length) return true
    else if (players?.length && !players.includes(player) && !!player?.length) return true
    return false
  }, [player, players]);

  return (
    <>
      <Container className="mt-4">
        { playerIsValid }
        <PlayerForm 
          player={player} 
          setPlayer={setPlayer} 
          addPlayer={addPlayer} 
          playerIsValid={playerIsValid} 
        />
      </Container>

      <Container className="mt-8">
        <h3>Jogadores</h3>
        <div className="mt-2">
          <PlayersTable players={players}/>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="positive" onClick={generateTournament}>
            Sortear
          </Button>
        </div>
      </Container>
      
      <Container className="mt-8">
        <h3>Jogadores</h3>
        <div className="mt-2">
          <TournamentTable tournament={tournament}/>
        </div>
      </Container>
    </>
  )
}
