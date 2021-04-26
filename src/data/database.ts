import { Player, PrismaClient } from '@prisma/client';

interface PlayerData {
    name: string,
    puuid: string,
}

export interface PlayerMatchInfo {
    name: string,
    lane: string,
    championName: string,
}

interface MatchData {
    matchId: string,
    win: boolean,
    players: PlayerMatchInfo[],
}

interface TeamData {
    id: number,
    players: Player[]
}

const makeClient = () => {
    return new PrismaClient()
}

export const createPlayer = async (playerInfo: PlayerData) => {
    console.log(`Creating player ${playerInfo.name}`)
    return makeClient().player.upsert({
        include: {
            Team: true
        },
        where: {
            name: playerInfo.name,
        },
        create: {
            name: playerInfo.name,
            puuid: playerInfo.puuid,
        },
        update: {
            puuid: playerInfo.puuid,
        }
    })
}

export const upsertMatch = async (matchInfo: MatchData, teamId: number) => {
    console.log(`Creating match...`)

    return makeClient().matches.upsert({
        where: {
            matchId: matchInfo.matchId,
        },
        create: {
            matchId: matchInfo.matchId,
            win: matchInfo.win,
            team: {
                connect: {
                    id: teamId
                }
            }
        },
        update: {
            matchId: matchInfo.matchId,
            win: matchInfo.win,
            team: {
                connect: {
                    id: teamId
                }
            }
        }
    })
}

export const upsertTeam = async (teamInfo: TeamData) => {
    console.log(`Creating team...`)
    const players = teamInfo.players;
    return await makeClient().team.upsert({
        where: {
            id: teamInfo.id || 0,
        },
        update: {
            players: {
                connectOrCreate: players.map((player) => ({
                    where: {
                        id: player.id,
                    },
                    create: {
                        name: player.name,
                        puuid: player.puuid,
                        teamId: { set: [teamInfo.id] }
                    }
                })),
            },
        },
        create: {
            players: {
                connectOrCreate: players.map((player) => ({
                    where: {
                        id: player.id,
                    },
                    create: {
                        name: player.name,
                        puuid: player.puuid,
                        teamId: { set: [teamInfo.id] }
                    }
                })),
            },
        }
    })
}