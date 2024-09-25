import type { JestConfigWithTsJest } from 'ts-jest';

export default async (): Promise<JestConfigWithTsJest> => ({
  displayName: 'Backend (E2E)',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: { '\\.[jt]sx?$': 'ts-jest' },
  maxWorkers: 1,
  roots: ['<rootDir>/tests/e2e'],
  globalSetup: './tests/support/globalDevEnvTestSetup.ts',
});
