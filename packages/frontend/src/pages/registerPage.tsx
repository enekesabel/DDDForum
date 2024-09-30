import { Layout } from '../components/layout';
import { MarketingEmailSignupInput, RegistrationForm, RegistrationInput } from '../components/registrationForm';
import { ToastContainer, toast } from 'react-toastify';
import { api } from '../api';
import { useUser } from '../contexts/userContext';
import { useNavigate } from 'react-router-dom';
import { useSpinner } from '../contexts/spinnerContext';
import { OverlaySpinner } from '../components/overlaySpinner';

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

  const handleSubmitRegistrationForm = async (input: RegistrationInput & MarketingEmailSignupInput) => {
    const { consent, ...registrationInput } = input;

    // Validate the form
    const validationResult = validateForm(registrationInput);

    // If the form is invalid
    if (!validationResult.success) {
      // Show an error toast (for invalid input)
      return toast.error(validationResult.errorMessage);
    }

    // If the form is valid
    // Start loading spinner
    spinner.activate();
    try {
      // Make API call
      const response = await api.register(registrationInput);
      // Save the user details to the cache
      setUser(response.data.data);
      console.log('setting data', response.data.data);

      // Handle signing up for marketing emails if necessary
      if (consent) {
        await api.signUpForMarketingEmails(registrationInput.email);
      }

      // Stop the loading spinner
      spinner.deactivate();

      // Show the toast
      toast('Success! Redirecting home.');
      // In 3 seconds, redirect to the main page
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (_err) {
      // If the call failed
      // Stop the spinner
      spinner.deactivate();
      // Show the toast (for unknown error)
      return toast.error('Some backend error occurred');
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
