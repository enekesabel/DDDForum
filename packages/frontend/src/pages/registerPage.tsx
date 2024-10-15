import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { UserExceptions } from '@dddforum/shared/src/modules/users';
import { GenericErrors } from '@dddforum/shared/src/shared';
import { Layout } from '../components/layout';
import { MarketingEmailSignupInput, RegistrationForm, RegistrationInput } from '../components/registrationForm';
import { api } from '../api';
import { useUser } from '../contexts/userContext';
import { useSpinner } from '../contexts/spinnerContext';
import { OverlaySpinner } from '../components/overlaySpinner';
import { AppSelectors } from '../shared';

type ValidationResult = {
  success: boolean;
  errorMessage?: string;
};

function validateForm(input: RegistrationInput): ValidationResult {
  if (input.email.indexOf('@') === -1) return { success: false, errorMessage: 'Email invalid' };
  if (input.username.length < 2) return { success: false, errorMessage: 'Username invalid' };
  return { success: true };
}

export const RegisterPage = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const spinner = useSpinner();

  const showFailureToast = (message: string) => {
    toast.error(message, {
      className: AppSelectors.notifications.failure.toClass(),
    });
  };

  const showSuccessToast = (message: string) => {
    toast.success(message, {
      className: AppSelectors.notifications.success.toClass(),
    });
  };

  const handleSubmitRegistrationForm = async (input: RegistrationInput & MarketingEmailSignupInput) => {
    const { consent, ...registrationInput } = input;

    // Validate the form
    const validationResult = validateForm(registrationInput);

    // If the form is invalid
    if (!validationResult.success) {
      // Show an error toast (for invalid input)
      return showFailureToast(validationResult.errorMessage);
    }

    // If the form is valid
    // Start loading spinner
    spinner.activate();
    try {
      // Make API call
      const response = await api.users.register(registrationInput);

      if (!response.success) {
        switch (response.error.code) {
          case UserExceptions.enum.EmailAlreadyInUse:
            return showFailureToast('This email is already in use. Perhaps you want to log in?');
          case UserExceptions.enum.UsernameAlreadyTaken:
            return showFailureToast('Please try a different username, this one is already taken.');
          case GenericErrors.enum.ValidationError:
            // We could further improve this with more
            // refined types to specify which
            // form field was invalid.
            return showFailureToast(response.error.message);
          case GenericErrors.enum.ServerError:
          default:
            return showFailureToast('Some backend error occurred');
        }
      }

      // Save the user details to the cache
      setUser(response.data);

      // Handle signing up for marketing emails if necessary
      if (consent) {
        await api.marketing.addEmailToList(registrationInput.email);
      }

      // Stop the loading spinner
      spinner.deactivate();

      // Show the toast
      showSuccessToast('Success! Redirecting home.');
      // In 3 seconds, redirect to the main page
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (_err) {
      // If the call failed
      // Stop the spinner
      spinner.deactivate();
      // Show the toast (for unknown error)
      return showFailureToast('Some backend error occurred');
    }
  };

  return (
    <Layout>
      <ToastContainer />
      <RegistrationForm
        onSubmit={(input: RegistrationInput & MarketingEmailSignupInput) => handleSubmitRegistrationForm(input)}
      />
      <OverlaySpinner isActive={spinner.spinner?.isActive} />
    </Layout>
  );
};
