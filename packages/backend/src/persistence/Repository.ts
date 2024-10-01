import { PrismaClient } from '@prisma/client';
import { Database } from '../Database';

export abstract class Repository {
  constructor(protected readonly database: Database) {}

  protected get prisma(): PrismaClient {
    return this.database.getConnection();
  }
}
