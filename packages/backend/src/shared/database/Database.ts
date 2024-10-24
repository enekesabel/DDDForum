import { PrismaClient } from '@prisma/client';

export class Database {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  getConnection() {
    return this.prisma;
  }

  async disconnect() {
    return this.prisma.$disconnect();
  }
}
