import type { JestConfigWithTsJest } from 'ts-jest';
import defaultConfig from '../../jest.base.config';

const unitConfig: JestConfigWithTsJest = {
  ...defaultConfig,
  displayName: 'Backend (Unit)',
  roots: ['<rootDir>/src'],
};

export default unitConfig;
