import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import path from 'path';

const feature = loadFeature(path.join(sharedTestRoot, 'features/registration.feature'));

defineFeature(feature, (test) => {
  test('Successful registration with marketing emails accepted', () => {});
});
