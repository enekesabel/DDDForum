import path from 'path';
import { Post } from '@prisma/client';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import { CompositionRoot, Application } from '../../../src/core';
import { Config } from '../../../src/shared';
import { DatabaseFixtures } from '../../support/fixtures/DatabaseFixtures';

const feature = loadFeature(path.join(sharedTestRoot, 'features/getPosts.feature'), {
  tagFilter: '@unit',
});

let compositionRoot: CompositionRoot;
let databaseFixtures: DatabaseFixtures;
let application: Application;

beforeAll(async () => {
  compositionRoot = CompositionRoot.Create(new Config('test:unit'));
  databaseFixtures = new DatabaseFixtures(compositionRoot);
  application = compositionRoot.getApplication();
});

beforeEach(async () => {
  await databaseFixtures.clearDatabase();
});

defineFeature(feature, (test) => {
  test('Successfully retrieve posts sorted by recent', ({ given, when, then }) => {
    let posts: Post[];
    let retrievedPosts: Awaited<ReturnType<typeof application.posts.getPosts>>;

    given(/^There are posts in the system already$/, async () => {
      const userInput = new UserInputBuilder().withAllRandomDetails().build();
      posts = await databaseFixtures.setUpWithRandomPostsByUser(userInput, 5);
      posts.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
    });

    when(/^I request the list of posts$/, async () => {
      retrievedPosts = await application.posts.getPosts();
    });

    then(/^I should receive the list of posts starting with the most recent$/, async () => {
      expect(retrievedPosts).toMatchObject(posts);
    });
  });
});
