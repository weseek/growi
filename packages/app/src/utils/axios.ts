// eslint-disable-next-line no-restricted-imports
import axios from 'axios';
import parseISO from 'date-fns/parseISO';
import isIsoDate from 'is-iso-date';

const customAxios = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
});

// add an interceptor to convert ISODate
const convertDates = (body: any): void => {
  if (body === null || body === undefined || typeof body !== 'object') {
    return body;
  }

  for (const key of Object.keys(body)) {
    const value = body[key];
    if (isIsoDate(value)) {
      body[key] = parseISO(value);
    }
    else if (typeof value === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      convertDates(value);
    }
  }
};
customAxios.interceptors.response.use((response) => {
  convertDates(response.data);
  return response;
});

export default customAxios;
