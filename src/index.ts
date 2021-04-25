import { ApolloServer } from "apollo-server";
import { PrismaClient, Team } from "@prisma/client";

const prisma = new PrismaClient();

const typeDefs = `
  type Player {
    id: Int
    name: String
    puuid: String
    Team: Team
  }
  type Team {
    id: Int
    players: [Player!]
    winRate: Int
  }
  type Match {
    id: Int
    team: Team  
    teamId: Int
    win: Boolean
  }
  type Query {
    players: [Player!]!
    teams: [Team!]!
    matches: [Match!]!
  }
`;

const resolvers = {
  Query: {
    players: () => {
      return prisma.player.findMany();
    },
    matches: () => {
      return prisma.matches.findMany({
        include: {
          team: {
            include: {
              players: true,
            },
          },
        },
      });
    },
    teams: async () => {
      return prisma.team.findMany({
        select: {
          id: true,
          players: true,
        },
      });
    },
  },
  Team: {
    winRate: {
      resolve: async (team: Team) => {
        const matches = await prisma.matches.findMany({
          where: { teamId: team.id },
        });
        return (
          (matches.reduce((acc, match) => (match.win ? acc + 1 : acc), 0) /
            matches.length) *
          100
        );
      },
    },
  },
};

const server = new ApolloServer({ resolvers, typeDefs });
server.listen({ port: 80 });
