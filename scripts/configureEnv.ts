import fs from 'fs';
import path from 'path';
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
      PORT: str(),
      CI: str({ choices: ['true', 'false'] }),
    }
  );
};

export const configureEnv = () => {
  const env = process.env.NODE_ENV || 'development';

  const envFilePath = path.resolve(__dirname, `../.env.${env}`);
  const envFileExists = fs.existsSync(envFilePath);
  if (!envFileExists) {
    throw new Error(`No .env.${env} file found at ${envFilePath}`);
  }
  validateEnv(envFilePath);
  console.log(`Preparing environment using ${envFilePath}`);
  dotenv.config({ path: envFilePath });
};
