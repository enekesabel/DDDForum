import { CompositionRoot } from './core';
import { Config } from './shared';

CompositionRoot.Create(new Config('start:prod')).getWebServer().start();
