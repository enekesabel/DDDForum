import type { JestConfigWithTsJest } from 'ts-jest';
import defaultConfig from '../../jest.base.config';

const e2eConfig: JestConfigWithTsJest = {
  ...defaultConfig,
  displayName: 'Frontend (E2E)',
  roots: ['<rootDir>/tests/e2e'],
};

export default e2eConfig;
