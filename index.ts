import axios from 'axios';
import { intersection } from 'lodash';

const headers = {
    "X-Riot-Token": "RGAPI-f57312e4-dd6f-43ea-87f8-e1fa92a24418"
}

const getPlayer = async (name: string) => (await axios({
    url: `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}`,
    headers
})).data

const getMatchesByPlayerId = async (playerId: string) => (await axios({
    url: `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${playerId}/ids?start=0&count=100`,
    headers
})).data

const getMatchInfoByMatchId = async (matchId: string) => (await axios({
    url: `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    headers
})).data

const getFiveStackInfo = async (names: string[]) => {
    const matches = await Promise.all(names.map(async (name) => {
        const playerInfo = await getPlayer(name);
        const matchIds = await getMatchesByPlayerId(playerInfo.puuid)
        return matchIds;
    }))

    const fiveStackMatches: string[] = intersection(...matches);

    return await Promise.all(fiveStackMatches.map(async fiveStackMatch =>
        await getMatchInfoByMatchId(fiveStackMatch)
    ))
}

const formatMatchInfo = (matches: any[], players: string[]) => {
    return matches.map(match => ({
        // if any player in the array has won, the team has won
        win: match.info.participants.find((player: any) => player.summonerName === players[0]).win,
        playerInfo: players.reduce((acc: {[key: string]: any}, name: string) => {
            const { lane, championName } = match.info.participants.find((player: any) => player.summonerName === name);
            acc[name] = {
                lane,
                championName
            }

            return acc;
        }, {})
    }))
}

(async function() {
    try {
        const names = ['epicevent', 'milquetoast', 'T 1 M B O ', 'JOHNNY JACUZZI', 'xYungxNeilx']
        const remoteMatchInfo = await getFiveStackInfo(names);
        const matchInfo = formatMatchInfo(remoteMatchInfo, names);
    } catch(e) {
        console.log(e)
    }
})()