import path from 'path';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import { UserInput } from '@dddforum/shared/src/modules/users';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders/UserInputBuilder';
import { App, createApp } from '../support/app';
import { PuppeteerPageDriver } from '../support/PuppeteerPageDriver';
import { DatabaseFixtures } from '../../../backend/tests/support/fixtures/DatabaseFixtures';

const feature = loadFeature(path.join(sharedTestRoot, 'features/registration.feature'), {
  tagFilter: '@frontend',
});

let app: App;
let pages: App['pages'];
let pageDriver: PuppeteerPageDriver;

defineFeature(feature, (test) => {
  beforeAll(async () => {
    pageDriver = await PuppeteerPageDriver.Create({
      headless: false,
    });
    app = await createApp(pageDriver);
    pages = app.pages;
  });

  afterAll(async () => {
    await pageDriver.close();
  });

  beforeEach(async () => {
    await DatabaseFixtures.ClearDatabase();
  });

  test('Successful registration with marketing emails accepted', ({ given, when, then, and }) => {
    let userInput: UserInput;

    given('I am a new user', async () => {
      userInput = new UserInputBuilder().withAllRandomDetails().build();
      await pages.registrationPage.open();
      await pages.registrationPage.acceptMarketingEmails();
    });

    when('I register with valid account details accepting marketing emails', async () => {
      await pages.registrationPage.enterAccountDetails(userInput);
      await pages.registrationPage.acceptMarketingEmails();
      await pages.registrationPage.submitRegistrationForm();
    });

    then('I should be granted access to my account', async () => {
      const successMessage = await app.layout.notifications.getSuccessMessage();
      expect(successMessage).toContain('Success! Redirecting home.');
      await app.waitForNavigation();
      expect(await app.layout.header.getLoggedInUserName()).toContain(userInput.username);
    });

    and('I should expect to receive marketing emails', () => {
      // @See backend
    });
  });

  test('Invalid or missing registration details', ({ given, when, then, and }) => {
    let invalidUserInput: UserInput;

    given('I am a new user', async () => {
      invalidUserInput = new UserInputBuilder().withAllRandomDetails().build();
      invalidUserInput.email = 'invalid-email'; // Set an invalid email
      await pages.registrationPage.open();
    });

    when('I register with invalid account details', async () => {
      await pages.registrationPage.enterAccountDetails(invalidUserInput);
      await pages.registrationPage.submitRegistrationForm();
    });

    then('I should see an error notifying me that my input is invalid', async () => {
      const errorMessage = await app.layout.notifications.getErrorMessage();
      expect(errorMessage).toContain('Email invalid');
    });

    and('I should not have been sent access to account details', async () => {
      expect(await app.layout.header.isUserLoggedIn()).toBe(false);
    });
  });

  test('Account already created with email', ({ given, when, then, and }) => {
    let existingUserInput: UserInput;

    given(
      'a set of users already created accounts',
      async (table: { firstName: string; lastName: string; email: string }[]) => {
        const userInputs = table.map((row) =>
          new UserInputBuilder()
            .withAllRandomDetails()
            .withFirstName(row.firstName)
            .withLastName(row.lastName)
            .withEmail(row.email)
            .build()
        );

        existingUserInput = userInputs[0];

        await DatabaseFixtures.SetupWithExistingUsers(...userInputs);
      }
    );

    when('new users attempt to register with those emails', async () => {
      await pages.registrationPage.open();
      await pages.registrationPage.enterAccountDetails(existingUserInput);
      await pages.registrationPage.submitRegistrationForm();
    });

    then('they should see an error notifying them that the account already exists', async () => {
      const errorMessage = await app.layout.notifications.getErrorMessage();
      expect(errorMessage).toContain('This email is already in use.');
    });

    and('they should not have been sent access to account details', async () => {
      expect(await app.layout.header.isUserLoggedIn()).toBe(false);
    });
  });
});
