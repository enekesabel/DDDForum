import type { JestConfigWithTsJest } from 'ts-jest';

const defaultConfig: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/js-with-ts',
  globalSetup: './tests/support/globalDevEnvTestSetup.ts',
};

export default defaultConfig;
