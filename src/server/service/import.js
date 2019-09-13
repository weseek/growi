const logger = require('@alias/logger')('growi:services:ImportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');
const streamToPromise = require('stream-to-promise');

class ImportService {

  constructor(crowi) {
    this.baseDir = path.join(crowi.tmpDir, 'downloads');
    this.encoding = 'utf-8';
    this.per = 100;
    this.zlibLevel = 9; // 0(min) - 9(max)
  }

  /**
   * import a collection from json
   *
   * @memberOf ImportService
   * @param {object} Model instance of mongoose model
   * @param {string} filePath path to zipped json
   */
  async importFromZip(Model, filePath) {
    const { collectionName } = Model.collection;
    let counter = 0;
    let nInsertedTotal = 0;

    let failedIds = [];
    let unorderedBulkOp = Model.collection.initializeUnorderedBulkOp();


    const readStream = fs.createReadStream(path.join(this.baseDir, 'pages.json'));
    const jsonStream = readStream.pipe(JSONStream.parse('*'));

    jsonStream.on('data', async(document) => {
      // documents are not persisted until unorderedBulkOp.execute()
      unorderedBulkOp.insert(document);

      counter++;

      if (counter % this.per === 0) {
        // puase jsonStream to prevent more items to be added to unorderedBulkOp
        jsonStream.pause();

        const { nInserted, failed } = await this.execUnorderedBulkOpSafely(unorderedBulkOp);
        nInsertedTotal += nInserted;
        failedIds = [...failedIds, ...failed];

        // reset initializeUnorderedBulkOp
        unorderedBulkOp = Model.collection.initializeUnorderedBulkOp();

        // resume jsonStream
        jsonStream.resume();
      }
    });

    jsonStream.on('end', async(data) => {
      // insert the rest. avoid errors when unorderedBulkOp has no items
      if (unorderedBulkOp.s.currentBatch !== null) {
        const { nInserted, failed } = await this.execUnorderedBulkOpSafely(unorderedBulkOp);
        nInsertedTotal += nInserted;
        failedIds = [...failedIds, ...failed];
      }

      logger.info(`Done. Inserted ${nInsertedTotal} ${collectionName}.`);

      if (failedIds.length > 0) {
        logger.error(`Failed to insert ${failedIds.length} ${collectionName}: ${failedIds.join(', ')}.`);
      }
    });

    // streamToPromise(jsonStream) throws error, so await readStream instead
    await streamToPromise(readStream);
  }

  /**
   * execute unorderedBulkOp and ignore errors
   *
   * @memberOf ImportService
   * @param {object} unorderedBulkOp result of Model.collection.initializeUnorderedBulkOp()
   * @param {string} filePath path to zipped json
   * @return {{nInserted: number, failed: string[]}} number of docuemnts inserted and failed
   */
  async execUnorderedBulkOpSafely(unorderedBulkOp) {
    // keep the number of documents inserted and failed for logger
    let nInserted = 0;
    const failed = [];

    // try catch to skip errors
    try {
      const log = await unorderedBulkOp.execute();
      nInserted = log.result.nInserted;
    }
    catch (err) {
      for (const error of err.result.result.writeErrors) {
        logger.error(error.errmsg);
        failed.push(error.err.op._id);
      }

      nInserted = err.result.result.nInserted;
    }

    logger.debug(`Importing ${unorderedBulkOp.s.collection.s.name}. Inserted: ${nInserted}. Failed: ${failed.length}.`);

    return {
      nInserted,
      failed,
    };
  }

}

module.exports = ImportService;
