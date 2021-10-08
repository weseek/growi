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

  function getPageReadableStream(basePagePath) {
    const Page = mongoose.model('Page');
    const { isTopPage } = pagePathUtils;

    const filter = {
      redirectTo: null,
    };
    // add $or condition if not top page
    if (!isTopPage(basePagePath)) {
      const basePathNormalized = pathUtils.normalizePath(basePagePath);
      const basePathWithTrailingSlash = pathUtils.addTrailingSlash(basePagePath);
      const startsPattern = escapeStringRegexp(basePathWithTrailingSlash);
      filter.$or = [{ path: basePathNormalized }, { path: new RegExp(`^${startsPattern}`) }];
    }

    return Page
      .find(
        filter,
        { _id: 0, path: 1, revision: 1 }, // projects data to fetch
      )
      .populate('revision')
      .lean()
      .cursor({ batchSize: 100 }); // get stream
  }

  function setUpArchiver() {
    // decide zip file path
    const timeStamp = (new Date()).getTime();
    const zipFilePath = path.join(__dirname, `${timeStamp}.md.zip`);

    const archive = archiver('zip', {
      zlib: { level: 9 }, // maximum compression
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') logger.error(err);
      else throw err;
    });
    // good practice to catch this error explicitly
    archive.on('error', (err) => { throw err });

    // pipe archive data to the file
    const output = fs.createWriteStream(zipFilePath);
    archive.pipe(output);

    return archive;
  }

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
    const { pageId, path: basePagePath, format } = req.body;

    try {
      // get pages with descendants as stream
      const pageReadableStream = getPageReadableStream(basePagePath);

      // set up archiver
      const archive = setUpArchiver();

      // read from pageReadableStream, write to markdown file readable buffer, then append it to archiver
      // pageReadableStream.pipe(pagesWritable) below will pipe the stream
      const pagesWritable = new Writable({
        objectMode: true,
        async write(page, encoding, callback) {
          try {
            const revision = page.revision;

            let markdownBody = 'This page does not have any content.';
            if (revision != null) {
              markdownBody = revision.body;
            }

            // write to zip
            const pathNormalized = pathUtils.normalizePath(page.path);
            archive.append(markdownBody, { name: `${pathNormalized}.md` });
          }
          catch (err) {
            logger.error('Error occurred while converting data to readable: ', err);
          }

          callback();
        },
        final(callback) {
          // TODO: multi-part upload instead of calling finalize() 78070
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
