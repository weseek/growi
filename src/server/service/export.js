const logger = require('@alias/logger')('growi:services:ExportService'); // eslint-disable-line no-unused-vars

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Page = mongoose.model('Page');

class ExportService {

  constructor(crowi) {
    this.baseDir = crowi.tmpDir;
    this.limit = 100;

    this.files = {
      pages: path.join(this.baseDir, 'pages.json'),
    };
  }

  /**
   * conver an array into writable string
   * e.g. [1, 2, 3,] => "1,2,3"
   *
   * @memberOf ExportService
   * @param {array} array
   */
  stringify(array) {
    // validate arguments
    if (!Array.isArray(array)) {
      throw new Error('Invalid input. Must be an array.');
    }

    const stringified = JSON.stringify(array);

    // remove the leading "[" and trailing "]"
    return stringified.substring(1, stringified.length - 1);
  }

  /**
   * dump a collection into json
   *
   * @memberOf ExportService
   * @param {string} file path to json file to write
   * @param {func} getTotalFn function to get the total count of documents in a collection
   * @param {func} paginatedQueryFn function to query db with pagination
   */
  async export(file, getTotalFn, paginatedQueryFn) {
    // validate arguments
    if (typeof getTotalFn !== 'function' || typeof paginatedQueryFn !== 'function') {
      throw new Error('getTotalFn and paginatedQueryFn must be a function)');
    }

    // convert to Promise if not
    const total = await Promise.resolve(getTotalFn());
    let pageNum = 0;
    let n = 0;

    const ws = fs.createWriteStream(file, { encoding: 'utf-8' });

    // open an array
    ws.write('[');

    while (n < total) {
      // convert to Promise if not
      // eslint-disable-next-line no-await-in-loop
      const pages = await Promise.resolve(paginatedQueryFn(this.limit, pageNum));

      // write comma for second chunk on
      if (n !== 0) {
        ws.write(',');
      }

      // wirte chunk to the file
      ws.write(this.stringify(pages));

      // increment number of items written and page number
      n += pages.length;
      pageNum++;

      logger.debug(`page ${pageNum} ... ${n}/${total} written`);
    }

    // close the array
    ws.write(']');

    ws.close();
  }

  /**
   * dump page collection
   *
   * @memberOf ExportService
   */
  async exportPageCollection() {
    const file = this.files.pages;

    const getTotalFn = () => {
      return Page.countDocuments();
    };

    const paginatedQueryFn = (limit, pageNum) => {
      return Page
        .find()
        .skip(limit * pageNum)
        .limit(limit);
    };

    await this.export(file, getTotalFn, paginatedQueryFn);
    logger.debug(`exported page collection into ${file}`);
  }

}

module.exports = ExportService;
