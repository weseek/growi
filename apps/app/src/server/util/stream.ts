export const convertStreamToBuffer = (stream: any): Promise<Buffer> => {

  return new Promise((resolve, reject) => {

    const buffer: Uint8Array[] = [];

    stream.on('data', (chunk: Uint8Array) => {
      buffer.push(chunk);
    });
    stream.on('end', () => resolve(Buffer.concat(buffer)));
    stream.on('error', err => reject(err));

  });
};
