import path from 'path';
import { Server } from 'http';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { GenericErrors } from '@dddforum/shared/src/shared';
import { APIClient } from '@dddforum/shared/src/core';
import { GetPostsResponse } from '@dddforum/shared/src/modules/posts';
import { Post } from '@prisma/client';
import { DatabaseFixtures } from '../../support';
import { CompositionRoot } from '../../../src/core';
import { Config } from '../../../src/shared';

const feature = loadFeature(path.join(sharedTestRoot, 'features/getPosts.feature'), {
  tagFilter: '@e2e',
});

let app: Server;
let apiClient: APIClient;
let databaseFixtures: DatabaseFixtures;
let compositionRoot: CompositionRoot;

beforeAll(async () => {
  compositionRoot = CompositionRoot.Create(new Config('test:e2e'));
  databaseFixtures = new DatabaseFixtures(compositionRoot);
  await databaseFixtures.clearDatabase();
  await compositionRoot.getWebServer().start();
  app = compositionRoot.getWebServer().getServer();
  apiClient = APIClient.FromServer(app);
});

afterAll(async () => {
  await compositionRoot.getWebServer().stop();
});

defineFeature(feature, (test) => {
  test('Successfully retrieve posts sorted by recent', ({ given, when, then }) => {
    let getPostsResponse: GetPostsResponse;
    let posts: Post[];

    given(/^There are posts in the system already$/, async () => {
      const userInput = new UserInputBuilder().withAllRandomDetails().build();
      posts = await databaseFixtures.setUpWithRandomPostsByUser(userInput, 5);
      posts.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
    });

    when(/^I request the list of posts$/, async () => {
      getPostsResponse = await apiClient.posts.getPosts('recent');
    });

    then(/^I should receive the list of posts starting with the most recent$/, () => {
      expect(getPostsResponse.data).toMatchObject(JSON.parse(JSON.stringify(posts)));
    });
  });

  test('Fail to retrieve posts when sorting is not provided', ({ given, when, then }) => {
    let getPostsResponse: GetPostsResponse;
    let posts: Post[];

    given(/^There are posts in the system already$/, async () => {
      const userInput = new UserInputBuilder().withAllRandomDetails().build();
      posts = await databaseFixtures.setUpWithRandomPostsByUser(userInput, 5);
      posts.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
    });

    when(/^I request the list of posts without specifying sorting$/, async () => {
      getPostsResponse = await apiClient.posts.getPosts('');
    });

    then(/^I should receive a client error$/, () => {
      expect(getPostsResponse.error).toMatchObject({ code: GenericErrors.enum.ClientError });
    });
  });
});
