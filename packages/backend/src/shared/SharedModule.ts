import { Database } from './database/Database';
import { prisma } from './database/prisma/prisma';
import { WebServer } from './WebServer';

export class SharedModule {
  private database: Database;
  private webServer: WebServer;

  constructor() {
    this.database = new Database(prisma);
    this.webServer = this.createWebServer();
  }

  private createWebServer() {
    const webServer = new WebServer({
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
