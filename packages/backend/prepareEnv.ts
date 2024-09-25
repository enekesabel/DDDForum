/**
 * This script allows you to call any other following script with
 * `ts-node prepareEnv <whatever you want to call next>` and if your app
 * is running in development mode (not no NODE_ENV set at all, assumed), it
 * will load the env file before you call the script. This loads the environment
 * up properly.
 *
 * We currently need this for prisma commands to allow prisma to take the config from
 * .env.development in development mode, and from the secrets in the deployment tools in
 * production.
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import { cleanEnv, str } from 'envalid';
import * as path from 'path';

const validateEnv = (envFile: string) => {
  cleanEnv(
    {
      ...dotenv.parse(fs.readFileSync(envFile)),
    },
    {
      DATABASE_URL: str(),
      NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
    }
  );
};

export const prepareEnv = (): void => {
  const env = process.env.NODE_ENV || 'development';
  const packageRoot = path.resolve(__dirname);
  const execParams = {
    cwd: packageRoot,
    stdio: 'inherit',
  } as const;
  const script = process.argv.splice(2).join(' ');
  const envFile = `.env.${env}`;
  const envFileExists = fs.existsSync(envFile);

  if (envFileExists) {
    validateEnv(envFile);
    console.log(`Preparing dev environment using ${envFile}`);
    execSync(`dotenv -e ${envFile} -- ${script}`, execParams);
    return;
  }

  console.log(`Running ${script} in ${process.env.NODE_ENV} mode without loading from env file.`);
  execSync(`${script}`, execParams);
};

prepareEnv();
