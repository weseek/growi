import { Writable } from 'stream';

const isProd = process.env.NODE_ENV === 'production';

const streamForEnv: any = isProd
  ? require('./stream.dev')
  : require('./stream.prod');

const stream: Writable = streamForEnv.default;
export default stream;
