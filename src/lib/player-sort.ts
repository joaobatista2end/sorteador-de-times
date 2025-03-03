export type Confrontation = { players: Array<string>, result?: string, scoreboard?: number }
export type Tournament = Array<Confrontation>

export const getTournament = (players: Array<string>): Tournament => {
    const tournament: Tournament = [];

    const addPlayerToTournament = (currentPlayerIndex: number, nextPlayerIndex: number) => {
        const confrontation: Confrontation = {
            players: [
                players[currentPlayerIndex],
                players[nextPlayerIndex]
            ],
            result: undefined,
            scoreboard: undefined
        }

        tournament.push(confrontation)
    }

    for (let currentPlayerIndex = 0; currentPlayerIndex < players.length; currentPlayerIndex++) {
        for (let nextPlayerIndex = currentPlayerIndex + 1; nextPlayerIndex < players.length; nextPlayerIndex++) {
            addPlayerToTournament(currentPlayerIndex, nextPlayerIndex)
        }
        
    }

    return tournament
}
