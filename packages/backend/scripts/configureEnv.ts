import fs from 'fs';
import dotenv from 'dotenv';
import { cleanEnv, str } from 'envalid';

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

export const configureEnv = () => {
  const env = process.env.NODE_ENV || 'development';

  const envFileExists = fs.existsSync(`.env.${env}`);
  if (!envFileExists) {
    throw new Error(`No .env.${env} file found`);
  }
  const envFile = `.env.${env}`;
  validateEnv(envFile);
  console.log(`Preparing dev environment using ${envFile}`);
  dotenv.config({ path: envFile });
};
