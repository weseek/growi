import mongoose from 'mongoose';
import fs, { write } from 'fs';
import path from 'path';
import streamToPromise from 'stream-to-promise';
import archiver from 'archiver';
import { Readable, Writable } from 'stream';
import { pathUtils } from 'growi-commons';
import { pagePathUtils } from '@growi/core';
import escapeStringRegexp from 'escape-string-regexp';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:routes:apiv3:export-job');

const express = require('express');
const ErrorV3 = require('../../models/vo/error-apiv3');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Export
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);

  /**
   * @swagger
   *
   *  /export-jobs:
   *    post:
   *      tags: [Export]
   *      operationId: createExportJob
   *      summary: /export-jobs
   *      description: create export job
   *      requestBody:
   *        required: true
   *        content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    type: number
   *                  format:
   *                    type: string
   *                required:
   *                  - pageId
   *                  - format
   *      responses:
   *        204:
   *          description: Job successfully created
   */
  router.post('/', accessTokenParser, loginRequired, csrf, async(req, res) => {
    const { isTopPage } = pagePathUtils;
    const { pageId, path: pagePath, format } = req.body;

    const Page = mongoose.model('Page');
    const { PageQueryBuilder } = Page;

    const $match = {
      redirectTo: null,
    };
    // add $or condition if not top page
    if (!isTopPage(pagePath)) {
      const pathNormalized = pathUtils.normalizePath(pagePath);
      const pathWithTrailingSlash = pathUtils.addTrailingSlash(pagePath);
      const startsPattern = escapeStringRegexp(pathWithTrailingSlash);
      $match.$or = [{ path: pathNormalized }, { path: new RegExp(`^${startsPattern}`) }];
    }

    try {
      // get pages with descendants as stream
      const pageReadableStream = Page.aggregate([
        {
          $match,
        },
        {
          $project: {
            _id: 1,
            path: 1,
            revisionId: 1,
            redirectTo: 1,
          },
        },
        {
          $lookup: {
            from: 'revision',
            localField: 'revisionId',
            foreignField: '_id',
            as: 'body',
          },
        },
      ]).cursor({ batchSize: 100 }).exec();

      const timeStamp = (new Date()).getTime();
      const zipFile = path.join(__dirname, `${timeStamp}.md.zip`);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') logger.error(err);
        else throw err;
      });

      // good practice to catch this error explicitly
      archive.on('error', (err) => { throw err });

      const output = fs.createWriteStream(zipFile);

      // pipe archive data to the file
      archive.pipe(output);

      const pagesWritable = new Writable({
        objectMode: true,
        async write(page, encoding, callback) {
          try {
            // create readable page buffer
            const readablePage = new Readable();
            readablePage._read = () => {}; // WIP
            readablePage.push('Revision.body'); // WIP
            readablePage.push(null); // WIP

            // push to zip
            archive.append(readablePage, { name: `${page._id}` }); // WIP
          }
          catch (err) {
            logger.error('Error occurred while converting data to readable: ', err);
          }

          callback();
        },
        final(callback) {
          // finalize the archive (ie we are done appending files but streams have to finish yet)
          // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
          archive.finalize();
          callback();
        },
      });

      pageReadableStream.pipe(pagesWritable);

      await streamToPromise(archive);
    }
    catch (err) {
      logger.error(err);
      const msg = 'Error occurred when starting export';
      return res.apiv3Err(new ErrorV3(msg, 'starting-export-failed'));
    }
    return res.apiv3();
  });

  return router;
};
