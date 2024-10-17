import { PrismaClient } from '@prisma/client';
import { Database } from '../database/Database';

export interface Repository {
  clear(): Promise<void>;
}

export abstract class ProductionRepository implements Repository {
  constructor(protected readonly database: Database) {}

  protected get prisma(): PrismaClient {
    return this.database.getConnection();
  }

  async clear(): Promise<void> {
    await this.database.connect();
    await this.clearData();
    await this.database.disconnect();
  }

  protected abstract clearData(): Promise<void>;
}
