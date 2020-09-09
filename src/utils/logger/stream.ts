import { Writable } from 'stream';

import streamDev from './stream.dev';
import streamProd from './stream.prod';

const isProd = process.env.NODE_ENV === 'production';

const stream: Writable = isProd ? streamProd : streamDev;
export default stream;
