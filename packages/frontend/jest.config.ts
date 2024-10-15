import type { JestConfigWithTsJest } from 'ts-jest';
import defaultConfig from '../../jest.base.config';

const frontendConfig: JestConfigWithTsJest = {
  ...defaultConfig,
  displayName: 'Frontend',
};

export default frontendConfig;
