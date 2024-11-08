import { Config } from './config';
import { Database } from './database/Database';
import { prisma } from './database/prisma/prisma';
import { WebServer } from './WebServer';

export class SharedModule {
  private database: Database;
  private webServer: WebServer;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.database = new Database(prisma);
    this.webServer = this.createWebServer();
  }

  private createWebServer() {
    const webServer = new WebServer({
      ...this.config,
      port: Number(process.env.PORT) || 3000,
    });

    return webServer;
  }

  getDatabase() {
    return this.database;
  }

  getWebServer() {
    return this.webServer;
  }
}
