// api.tsx
import { RegistrationInput } from './components/registrationForm';
import axios from 'axios';

export const api = {
  posts: {
    getPosts: () => {
      return axios.get('http://localhost:3000/posts?sort=recent');
    },
  },
  register: (input: RegistrationInput) => {
    return axios.post('http://localhost:3000/users/new', {
      ...input,
    });
  },
  signUpForMarketingEmails: (email: string) => {
    return axios.post('http://localhost:3000/marketing/new');
  },
};
