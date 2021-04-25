import axios from "axios";
import { intersection } from "lodash";
import {
  upsertMatch,
  createPlayer,
  PlayerMatchInfo,
  upsertTeam,
  updateTeamWinRate,
} from "./database";

const headers = {
  "X-Riot-Token": "RGAPI-f453fb07-82e5-48d1-8d55-09110bc1516b",
};

const getPlayer = async (name: string) =>
  (
    await axios({
      url: `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}`,
      headers,
    })
  ).data;

const getMatchesByPlayerId = async (playerId: string) =>
  (
    await axios({
      url: `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${playerId}/ids?start=0&count=100`,
      headers,
    })
  ).data;

const getMatchInfoByMatchId = async (matchId: string) =>
  (
    await axios({
      url: `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      headers,
    })
  ).data;

const getFiveStackInfo = async (names: string[]) => {
  const players = await Promise.all(
    names.map(async (name) => {
      const playerInfo = await getPlayer(name);
      // savePlayer
      return createPlayer(playerInfo);
    })
  );

  // If all members have the same teamID then update their existing team,
  // if any members have a different teamID, then assign them to a new team
  const id = players.reduce(
    (acc, player) => (player.teamId === acc ? player.teamId : 0),
    players[0].teamId || 0
  );
  const team = await upsertTeam({ players, id });

  const matches = await Promise.all(
    players.map(async (player) => {
      return getMatchesByPlayerId(player.puuid);
    })
  );

  const fiveStackMatches: string[] = intersection(...matches);

  return {
    team: team.id,
    matches: await Promise.all(
      fiveStackMatches.map(async (fiveStackMatch) => {
        return await getMatchInfoByMatchId(fiveStackMatch);
      })
    ),
  };
};

const formatMatchInfo = (matches: any[], players: string[]) => {
  return matches.map((match) => ({
    matchId: match.metadata.matchId,
    // if any player in the array has won, the team has won
    win: match.info.participants.find(
      (player: any) => player.summonerName === players[0]
    ).win,
    players: players.reduce((acc: PlayerMatchInfo[], name: string) => {
      const { lane, championName } = match.info.participants.find(
        (player: any) => player.summonerName === name
      );
      acc.push({
        name,
        lane,
        championName,
      });

      return acc;
    }, []),
  }));
};

(async function () {
  try {
    console.log("Starting ingest...");
    const names = [
      "epicevent",
      "milquetoast",
      "T 1 M B O ",
      "JOHNNY JACUZZI",
      "xYungxNeilx",
    ];
    const remoteMatchInfo = await getFiveStackInfo(names);
    const matchInfo = formatMatchInfo(remoteMatchInfo.matches, names);
    matchInfo.forEach(async (match) => {
      await upsertMatch(match, remoteMatchInfo.team);
    });
  } catch (e) {
    console.log(e);
  }
})();
