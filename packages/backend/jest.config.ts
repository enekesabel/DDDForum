import type { JestConfigWithTsJest } from 'ts-jest';
import defaultConfig from '../../jest.base.config';

const backendConfig: JestConfigWithTsJest = {
  ...defaultConfig,
  displayName: 'Backend',
  roots: ['<rootDir>'],
};

export default backendConfig;
