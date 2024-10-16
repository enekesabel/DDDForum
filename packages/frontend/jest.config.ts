import type { JestConfigWithTsJest } from 'ts-jest';
import defaultConfig from '../../jest.base.config';

const frontendConfig: JestConfigWithTsJest = {
  ...defaultConfig,
  displayName: 'Frontend',
  roots: ['<rootDir>'],
};

export default frontendConfig;
