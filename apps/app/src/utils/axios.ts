// eslint-disable-next-line no-restricted-imports
import axios from 'axios';
import dayjs from 'dayjs';
import qs from 'qs';

// eslint-disable-next-line no-restricted-imports
export * from 'axios';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function convertDateStringsToDates(data: any): any {
  if (typeof data !== 'object' || data === null) {
    if (typeof data === 'string' && isoDateRegex.test(data)) {
      return new Date(data);
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => convertDateStringsToDates(item));
  }

  for (const key of Object.keys(data)) {
    const value = data[key];
    if (typeof value === 'string' && isoDateRegex.test(value)) {
      data[key] = new Date(value);
    }

    else if (typeof value === 'object' && value !== null) {
      data[key] = convertDateStringsToDates(value);
    }
  }
  return data;
}

// Determine the base array of transformers
let baseTransformers = axios.defaults.transformResponse;

if (baseTransformers == null) {
  baseTransformers = [];
}

else if (!Array.isArray(baseTransformers)) {
  // If it's a single transformer function, wrap it in an array
  baseTransformers = [baseTransformers];
}


const customAxios = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },

  transformResponse: baseTransformers.concat(
    (data) => {
      return convertDateStringsToDates(data);
    },
  ),
});

// serialize Date config: https://github.com/axios/axios/issues/1548#issuecomment-548306666
customAxios.interceptors.request.use((config) => {
  config.paramsSerializer = params => qs.stringify(params, { serializeDate: (date: Date) => dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ') });
  return config;
});

export default customAxios;
