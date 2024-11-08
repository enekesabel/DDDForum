import type { JestConfigWithTsJest } from 'ts-jest';
import defaultConfig from '../../jest.base.config';

const unitConfig: JestConfigWithTsJest = {
  ...defaultConfig,
  displayName: 'Backend (Unit)',
  roots: ['<rootDir>/src', '<rootDir>/tests/features'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '!**/*.infra.test.ts', '<rootDir>/tests/features/**/*.unit.test.ts'],
};

export default unitConfig;
