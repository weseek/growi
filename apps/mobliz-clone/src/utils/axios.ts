// eslint-disable-next-line no-restricted-imports
import axios from 'axios';

const customAxios = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
});

export default customAxios;
