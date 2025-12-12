import { PrismaClient } from '@prisma/client';
import { PrismaTiDBCloud } from "@tidbcloud/prisma-adapter";
import { connect } from "@tidbcloud/serverless";

let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const connection = connect({ url: process.env.DATABASE_URL });
    const adapter = new PrismaTiDBCloud(connection);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export default getPrismaClient;
