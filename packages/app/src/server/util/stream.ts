function convertStreamToBuffer(stream: any): Promise<Buffer> {

  return new Promise((resolve, reject) => {

    const _buf: Uint8Array[] = [];

    stream.on('data', (chunk: Uint8Array) => {
      _buf.push(chunk);
    });
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', err => reject(err));

  });
}


export default convertStreamToBuffer;
