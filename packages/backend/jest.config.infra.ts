import type { JestConfigWithTsJest } from 'ts-jest';
import defaultConfig from '../../jest.base.config';

const unitConfig: JestConfigWithTsJest = {
  ...defaultConfig,
  displayName: 'Backend (Infra)',
  roots: ['<rootDir>/src', '<rootDir>/tests/features'],
  testMatch: ['**/*.infra.test.ts'],
};

export default unitConfig;
