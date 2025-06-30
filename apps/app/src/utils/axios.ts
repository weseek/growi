// eslint-disable-next-line no-restricted-imports
import axios from 'axios';
import dayjs from 'dayjs';
import qs from 'qs';

// eslint-disable-next-line no-restricted-imports
export * from 'axios';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;

// Utility type to decide the resulting type of every input object at compile time.
type DeepDateConvert<T> = T extends string
    ? (string extends T ? T : (RegExpMatchArray extends T ? T : Date)) // If T is exactly string it becomes Date
    : T extends (infer U)[]
    ? DeepDateConvert<U>[] // If T is an array, map its elements
    : T extends object
    ? { [K in keyof T]: DeepDateConvert<T[K]> } // If T is an object, map its properties
    : T;

function convertStringsToDatesRecursive<T>(data: T, seen: Set<any>): DeepDateConvert<T> {
  if (typeof data !== 'object' || data === null) {
    if (typeof data === 'string' && isoDateRegex.test(data)) {
      return new Date(data) as DeepDateConvert<T>;
    }
    return data as DeepDateConvert<T>;
  }

  // Check for circular reference
  if (seen.has(data)) {
    return data as DeepDateConvert<T>;
  }
  seen.add(data);

  if (Array.isArray(data)) {
    const resultArray = (data as any[]).map(array => convertStringsToDatesRecursive(array, seen));
    return resultArray as DeepDateConvert<T>;
  }

  const newData: { [key: string]: any } = {};

  for (const key of Object.keys(data as object)) {
    const value = (data as any)[key];

    if (typeof value === 'string' && isoDateRegex.test(value)) {
      newData[key] = new Date(value);
    }

    else if (typeof value === 'object' && value !== null) {
      newData[key] = convertStringsToDatesRecursive(value, seen);
    }

    else {
      newData[key] = value;
    }
  }

  return newData as DeepDateConvert<T>;
}

export function convertStringsToDates<T>(data: T): DeepDateConvert<T> {
  return convertStringsToDatesRecursive(data, new Set());
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
      return convertStringsToDates(data);
    },
  ),
});

// serialize Date config: https://github.com/axios/axios/issues/1548#issuecomment-548306666
customAxios.interceptors.request.use((config) => {
  config.paramsSerializer = params => qs.stringify(params, { serializeDate: (date: Date) => dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ') });
  return config;
});

export default customAxios;
