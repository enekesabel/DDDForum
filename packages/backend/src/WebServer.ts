import express, { ErrorRequestHandler, Express, RequestHandler } from 'express';
import cors from 'cors';
import { Server } from 'http';
import { Controller } from './controllers/Controller';

type WebServerConfig = {
  port: number;
};

export class WebServer {
  private config: WebServerConfig;
  private express: Express;
  private server: Server | undefined;

  constructor(config: WebServerConfig) {
    this.config = config;
    this.express = express();
    this.express.use(express.json());
    this.express.use(cors());
  }

  registerController(path: string, controller: Controller) {
    this.express.use(path, controller.getRouter());
  }

  registerMiddleware(middleware: RequestHandler | ErrorRequestHandler) {
    this.express.use(middleware);
  }

  async start() {
    this.server = this.express.listen(this.config.port);
    console.log(`Server is running on port ${this.config.port}`);
  }

  async stop() {
    return new Promise<void>((resolve, reject) => {
      if (!this.server) {
        return reject(new Error('Server is not started'));
      }

      this.server.close((err) => {
        if (err) {
          reject(err);
        }
        console.log('Server is stopped');
        resolve();
      });
    });
  }

  getServer(): Server {
    if (!this.server) {
      throw new Error('Server is not started');
    }
    return this.server;
  }
}
