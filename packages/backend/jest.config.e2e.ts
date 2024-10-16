import type { JestConfigWithTsJest } from 'ts-jest';
import defaultConfig from '../../jest.base.config';

const e2eConfig: JestConfigWithTsJest = {
  ...defaultConfig,
  displayName: 'Backend (E2E)',
  maxWorkers: 1,
  roots: ['<rootDir>/tests/features'],
  testMatch: ['**/*.e2e.test.ts'],
};

export default e2eConfig;
