const logger = require('@alias/logger')('growi:services:ExportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const streamToPromise = require('stream-to-promise');

class ExportService {

  constructor(crowi) {
    this.baseDir = path.join(crowi.tmpDir, 'downloads');
    this.extension = 'json';
    this.encoding = 'utf-8';
    this.per = 10;

    this.files = {};
    // populate this.files
    // this.files = {
    //   configs: path.join(this.baseDir, 'configs.json'),
    //   pages: path.join(this.baseDir, 'pages.json'),
    //   pagetagrelations: path.join(this.baseDir, 'pagetagrelations.json'),
    //   ...
    // };
    // TODO: handle 3 globalnotificationsettings collection properly
    // see Object.values(crowi.models).forEach((m) => { return console.log(m.collection.collectionName) });
    Object.values(crowi.models).forEach((m) => {
      const name = m.collection.collectionName;
      this.files[name] = path.join(this.baseDir, `${name}.${this.extension}`);
    });
  }

  /**
   * dump a collection into json
   *
   * @memberOf ExportService
   * @param {string} file path to json file to write
   * @param {readStream} readStream  read stream
   * @param {func} total number of target items (optional)
   */
  async export(file, readStream, total) {
    const ws = fs.createWriteStream(file, { encoding: this.encoding });
    let n = 0;

    // open an array
    ws.write('[');

    await streamToPromise(
      readStream
        .on('data', (chunk) => {
          if (n !== 0) {
            ws.write(',');
          }

          ws.write(JSON.stringify(chunk));

          n++;
          this.logProgress(n, total);
        })
        .on('end', () => {
        // close the array
          ws.write(']');
          ws.close();
        }),
    );
  }

  logProgress(n, total) {
    let output;
    if (total) {
      output = `${n}/${total} written`;
    }
    else {
      output = `${n} items written`;
    }

    // output every this.per items and last item
    if (n % this.per === 0 || n === total) {
      logger.debug(output);
    }
  }

  /**
   * dump a mongodb collection into json
   *
   * @memberOf ExportService
   * @param {object} Model instance of mongoose model
   */
  async exportCollection(Model) {
    const file = this.files[Model.collection.collectionName];
    const total = await Model.countDocuments();
    const readStream = Model.find().cursor();

    await this.export(file, readStream, total);

    logger.debug(`exported ${Model.collection.collectionName} collection into ${file}`);
  }

}

module.exports = ExportService;
