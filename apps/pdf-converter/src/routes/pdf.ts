import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import pdfConvertService, { JobStatus } from '../service/pdf-convert';
import loggerFactory from '../utils/logger';

const logger = loggerFactory('routes:pdf');

const app = new Hono()
  .post('/sync-job',
    zValidator(
      'json',
      z.object({
        jobId: z.string(),
        expirationDate: z.string().datetime(),
        status: z.enum([JobStatus.HTML_EXPORT_IN_PROGRESS, JobStatus.HTML_EXPORT_DONE, JobStatus.FAILED]),
      }),
    ),
    (c) => {
      const { jobId, expirationDate: expirationDateStr, status: growiJobStatus } = c.req.valid('json');
      const expirationDate = new Date(expirationDateStr);

      try {
        pdfConvertService.registerOrUpdateJob(jobId, expirationDate, growiJobStatus);
        pdfConvertService.cleanUpJobList();
        return c.json({ status: pdfConvertService.getJobStatus(jobId) });
      }
      catch (err) {
        logger.error(err);
        return c.json({ err }, 500);
      }
    });

export default app;
