// eslint-disable-next-line no-restricted-imports
import axios from 'axios';

export default axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
});
