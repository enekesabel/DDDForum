import path from 'path';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import { User } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { Application, CompositionRoot } from '../../../src/core';
import { Config } from '../../../src/shared';
import { DatabaseFixtures } from '../../support';
import { GetUserQuery, UserNotFoundException } from '../../../src/modules/users';

const feature = loadFeature(path.join(sharedTestRoot, 'features/getUserByEmail.feature'), {
  tagFilter: '@unit',
});

let application: Application;
let databaseFixtures: DatabaseFixtures;
let compositionRoot: CompositionRoot;

beforeAll(async () => {
  compositionRoot = CompositionRoot.Create(new Config('test:unit'));
  application = compositionRoot.getApplication();
  databaseFixtures = new DatabaseFixtures(compositionRoot);
});

beforeEach(async () => {
  await databaseFixtures.clearDatabase();
});

defineFeature(feature, (test) => {
  test('Successfully retrieve user details by email', ({ given, when, then }) => {
    let user: User;
    let emailToFind: string;

    given(/^a user exists with the email "(.*)"$/, async (email: string) => {
      emailToFind = email;
      await databaseFixtures.setupWithExistingUsers(
        new UserInputBuilder().withAllRandomDetails().withEmail(email).build()
      );
    });

    when(/^I request user details using the email "(.*)"$/, async (email: string) => {
      user = await application.users.getUser(GetUserQuery.Create(email));
    });

    then('I should receive the user details', () => {
      expect(user.email).toBe(emailToFind);
    });
  });

  test('User not found', ({ given, when, then }) => {
    let getUserError: UserNotFoundException;
    given(/^No user with email "(.*)" exists$/, async () => {});

    when(/^I request user details using the email "(.*)"$/, async (email: string) => {
      try {
        await application.users.getUser(GetUserQuery.Create(email));
      } catch (error) {
        getUserError = error as UserNotFoundException;
      }
    });

    then('I should receive an error indicating that the user was not found', () => {
      expect(getUserError).toBeInstanceOf(UserNotFoundException);
    });
  });
});
