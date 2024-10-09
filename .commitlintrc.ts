import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';
import { readdirSync } from 'fs';
import { join } from 'path';

const packageFolderNames = readdirSync(join(__dirname, 'packages'));

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
  rules: {
    'scope-enum': [RuleConfigSeverity.Error, 'always', packageFolderNames],
  },
  // ...
};

export default Configuration;
