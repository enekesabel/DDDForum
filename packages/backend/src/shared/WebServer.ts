import { Server } from 'http';
import { exec } from 'child_process';
import express, { ErrorRequestHandler, Express, RequestHandler } from 'express';
import cors from 'cors';
import { Controller } from './Controller';

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
    await this.killProcessRunningOnPort();
    this.server = this.express.listen(this.config.port);
    console.log(`Server is running on port ${this.config.port}`);
  }

  private async killProcessRunningOnPort() {
    await new Promise<void>((resolve, reject) => {
      const cmd = `lsof -t -i :${this.config.port} | xargs kill`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        if (stderr) {
          return reject(new Error(stderr));
        }
        resolve();
      });
    });
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
