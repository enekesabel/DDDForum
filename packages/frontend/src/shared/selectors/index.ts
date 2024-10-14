import { buildAppSelectors } from './appSelectorUtils';

export const AppSelectors = buildAppSelectors({
  registration: {
    registrationForm: {
      email: { selector: '.registration.email' },
      username: { selector: '.registration.username' },
      firstname: { selector: '.registration.first-name' },
      lastname: { selector: '.registration.last-name' },
      marketingCheckbox: {
        selector: '.registration.marketing-emails',
      },
      submit: { selector: '.registration.submit-button' },
    },
  },
  header: {
    username: { selector: '.header.user-name' },
  },
  notifications: {
    failure: {
      selector: '.toast-failure',
    },
    success: {
      selector: '.toast-success',
    },
  },
});
