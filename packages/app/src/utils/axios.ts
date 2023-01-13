// eslint-disable-next-line no-restricted-imports
import axios from 'axios';
import dayjs from 'dayjs';
import qs from 'qs';

const customAxios = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
});

// serialize Date config: https://github.com/axios/axios/issues/1548#issuecomment-548306666
customAxios.interceptors.request.use((config) => {
  config.paramsSerializer = params => qs.stringify(params, { serializeDate: (date: Date) => dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ') });
  return config;
});

export default customAxios;
