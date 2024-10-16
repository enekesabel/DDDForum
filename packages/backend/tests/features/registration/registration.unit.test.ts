import path from 'path';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import { UserInput } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders';
import { Application, CompositionRoot } from '../../../src/core';
import { Config } from '../../../src/shared';

const feature = loadFeature(path.join(sharedTestRoot, 'features/registration.feature'), {
  tagFilter: '@unit',
});

let compositionRoot: CompositionRoot;
let application: Application;
let addEmailToListSpy: jest.SpyInstance;

beforeEach(async () => {
  addEmailToListSpy = jest.spyOn(application.marketing, 'addEmailToList');
});

beforeAll(async () => {
  compositionRoot = CompositionRoot.Create(new Config('test:unit'));
  application = compositionRoot.getApplication();
});

defineFeature(feature, (test) => {
  test('Successful registration with marketing emails accepted', ({ given, when, then, and }) => {
    let createdUser: Awaited<ReturnType<typeof application.users.createUser>>;
    let createUserInput: UserInput;

    given('I am a new user', async () => {
      createUserInput = new UserInputBuilder().withAllRandomDetails().build();
    });

    when('I register with valid account details accepting marketing emails', async () => {
      createdUser = await application.users.createUser(createUserInput);

      await application.marketing.addEmailToList(createUserInput.email);
    });

    then('I should be granted access to my account', async () => {
      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toEqual(createUserInput.email);
      expect(createdUser.firstName).toEqual(createUserInput.firstName);
      expect(createdUser.lastName).toEqual(createUserInput.lastName);
      expect(createdUser.username).toEqual(createUserInput.username);

      const newUser = await application.users.getUserByEmail(createUserInput.email);

      expect(newUser.email).toEqual(createUserInput.email);
    });

    and('I should expect to receive marketing emails', () => {
      expect(addEmailToListSpy).toHaveBeenCalledTimes(1);
      expect(addEmailToListSpy).toHaveBeenCalledWith(createUserInput.email);
    });
  });
});
