import axios from 'axios';
import { addHours } from 'date-fns/addHours';
import { isAfter } from 'date-fns/isAfter';
import { Router } from 'express';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:staffs'); // eslint-disable-line no-unused-vars


const router = Router();

const contributors = require('^/resource/Contributor');

let expiredAt;
const contributorsCache = contributors;
let gcContributors;

// Sorting contributors by this method
const compareFunction = function(a, b) {
  return a.order - b.order;
};

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     Staff:
 *       type: object
 *       properties:
 *         order:
 *           type: integer
 *           example: 1
 *         sectionName:
 *           type: string
 *           example: GROWI VILLAGE
 *         additionalClass:
 *           type: string
 *           example: ""
 *         memberGroups:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               additionalClass:
 *                 type: string
 *                 example: col-md-12 my-4
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     position:
 *                       type: string
 *                       example: Founder
 *                     name:
 *                       type: string
 *                       example: yuki-takei
 */
/** @param {import('~/server/crowi').default} crowi Crowi instance */
module.exports = (crowi) => {
  /**
   * @swagger
   *
   * /staffs:
   *   get:
   *     summary: Get staffs
   *     security: []
   *     tags: [Staff]
   *     responses:
   *       200:
   *         description: Staffs fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 contributors:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Staff'
   */
  router.get('/', async(req, res) => {
    const now = new Date();
    const growiCloudUri = await crowi.configManager.getConfig('app:growiCloudUri');

    if (growiCloudUri != null && (expiredAt == null || isAfter(now, expiredAt))) {
      const url = new URL('_api/staffCredit', growiCloudUri);
      try {
        const gcContributorsRes = await axios.get(url.toString());
        if (gcContributors == null) {
          gcContributors = gcContributorsRes.data;
          // merging contributors
          contributorsCache.push(gcContributors);
        }
        // Change the order of section
        contributorsCache.sort(compareFunction);
        // caching 'expiredAt' for 1 hour
        expiredAt = addHours(now, 1);
      }
      catch (err) {
        logger.warn('Getting GROWI.cloud staffcredit is failed');
      }
    }
    return res.apiv3({ contributors: contributorsCache });
  });

  return router;

};
