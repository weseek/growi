const logger = require('@alias/logger')('growi:services:ImportService'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const JSONStream = require('JSONStream');
const streamToPromise = require('stream-to-promise');

class ImportService {

  constructor(crowi) {
    this.baseDir = path.join(crowi.tmpDir, 'downloads');
    this.encoding = 'utf-8';
    this.per = 100;
    this.zlibLevel = 9; // 0(min) - 9(max)

    const { ObjectId } = require('mongoose').Types;
    const keepOriginal = v => v;
    const toObjectId = v => ObjectId(v);
    // each key accepts either function or hardcoded value
    // to filter out an attribute, try "[key]: undefined" or unlisting the key
    this.attrMap = {
      pages: {
        _id: toObjectId,
        path: keepOriginal,
        revision: toObjectId,
        redirectTo: keepOriginal,
        status: 'published', // FIXME when importing users and user groups
        grant: 1, // FIXME when importing users and user groups
        grantedUsers: [], // FIXME when importing users and user groups
        grantedGroup: null, // FIXME when importing users and user groups
        // creator: keepOriginal, // FIXME when importing users
        // lastUpdateUser: keepOriginal, // FIXME when importing users
        liker: [], // FIXME when importing users
        seenUsers: [], // FIXME when importing users
        commentCount: 0, // FIXME when importing comments
        extended: {}, // FIXME when ?
        // pageIdOnHackmd: keepOriginal, // FIXME when importing hackmd?
        // revisionHackmdSynced: keepOriginal, // FIXME when importing hackmd?
        // hasDraftOnHackmd: keepOriginal, // FIXME when importing hackmd?
        createdAt: keepOriginal,
        updatedAt: keepOriginal,
      },
    };

    this.overwriteOption = {
      pages: (req) => {
        return {
          creator: mongoose.Types.ObjectId(req.user._id),
          lastUpdateUser: mongoose.Types.ObjectId(req.user._id),
        };
      },
    };
  }

  /**
   * import a collection from json
   *
   * @memberOf ImportService
   * @param {object} Model instance of mongoose model
   * @param {string} filePath path to zipped json
   * @param {object} overwriteOption overwrite each document with unrelated value. e.g. { creator: req.user }
   */
  async importFromZip(Model, filePath, overwriteOption = {}) {
    const { collectionName } = Model.collection;
    let counter = 0;
    let nInsertedTotal = 0;

    let failedIds = [];
    let unorderedBulkOp = Model.collection.initializeUnorderedBulkOp();

    const readStream = fs.createReadStream(path.join(this.baseDir, 'pages.json')); // FIXME
    const jsonStream = readStream.pipe(JSONStream.parse('*'));

    jsonStream.on('data', async(document) => {
      // documents are not persisted until unorderedBulkOp.execute()
      unorderedBulkOp.insert(this.convertDocuments(Model, document, overwriteOption));

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

  /**
   * execute unorderedBulkOp and ignore errors
   *
   * @memberOf ImportService
   * @param {object} Model instance of mongoose model
   * @param {object} _document document being imported
   * @param {object} overwriteOption overwrite each document with unrelated value. e.g. { creator: req.user }
   * @return {object} document to be persisted
   */
  convertDocuments(Model, _document, overwriteOption) {
    const attrMap = this.attrMap[Model.collection.collectionName];
    if (attrMap == null) {
      throw new Error(`attribute map is not defined for ${Model.collection.collectionName}`);
    }

    const document = {};

    // generate value from documents being imported
    for (const entry of Object.entries(attrMap)) {
      const key = entry[0];
      const value = entry[1];

      // distinguish between null and undefined
      if (_document[key] !== undefined) {
        document[key] = (typeof value === 'function') ? value(_document[key]) : value;
      }
    }

    // overwrite documents
    for (const entry of Object.entries(overwriteOption)) {
      const key = entry[0];
      const value = entry[1];

      // distinguish between null and undefined
      if (_document[key] !== undefined) {
        document[key] = (typeof value === 'function') ? value(_document[key]) : value;
      }
    }

    return document;
  }

  getOverwriteOption(Model) {
    return this.overwriteOption[Model.collection.collectionName];
  }

}

module.exports = ImportService;
