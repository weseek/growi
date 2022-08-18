import path from 'path';
import { Readable, Writable, Transform } from 'stream';

// eslint-disable-next-line no-restricted-imports
import axios from 'axios';
import fs from 'graceful-fs';
import mkdirp from 'mkdirp';
import streamToPromise from 'stream-to-promise';


export async function downloadTo(url: string, outDir: string, fileName: string, transform: Transform|null = null): Promise<void> {
  // get
  const response = await axios.get(url, { responseType: 'stream' });
  // mkdir -p
  mkdirp.sync(outDir);

  // replace and write
  let stream: Readable = response.data;
  if (transform != null) {
    stream = stream.pipe(transform);
  }
  const file = path.join(outDir, fileName);
  const writeStream: Writable = stream.pipe(fs.createWriteStream(file));

  return streamToPromise(writeStream);
}
