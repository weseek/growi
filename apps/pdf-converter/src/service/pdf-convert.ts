import fs from 'fs';
import path from 'path';
import { Readable, Writable } from 'stream';
import { pipeline as pipelinePromise } from 'stream/promises';

import { Cluster } from 'puppeteer-cluster';

import loggerFactory from '../utils/logger';

const logger = loggerFactory('services:PdfConvertService');

interface PageInfo {
  htmlString: string;
  htmlFilePath: string;
}

export const JobStatusSharedWithGrowi = {
  HTML_EXPORT_IN_PROGRESS: 'HTML_EXPORT_IN_PROGRESS',
  HTML_EXPORT_DONE: 'HTML_EXPORT_DONE',
  FAILED: 'FAILED',
} as const;

export const JobStatus = {
  ...JobStatusSharedWithGrowi,
  PDF_EXPORT_DONE: 'PDF_EXPORT_DONE',
} as const;

type JobStatusSharedWithGrowi = typeof JobStatusSharedWithGrowi[keyof typeof JobStatusSharedWithGrowi]
export type JobStatus = typeof JobStatus[keyof typeof JobStatus]

interface JobInfo {
  expirationDate: Date;
  status: JobStatus;
  currentStream?: Readable;
}

class PdfConvertService {

  private puppeteerCluster: Cluster | undefined;

  private maxConcurrency = 1;

  private convertRetryLimit = 5;

  private tmpOutputRootDir = '/tmp/page-bulk-export';

  private tmpHtmlDir = `${this.tmpOutputRootDir}/html`;

  private jobList: {
    [key: string]: JobInfo;
  } = {};

  constructor() {
    this.initPuppeteerCluster();
  }

  registerOrUpdateJob(jobId: string, expirationDate: Date, status: JobStatusSharedWithGrowi): void {
    const isJobNew = !(jobId in this.jobList);

    if (isJobNew) {
      this.jobList[jobId] = { expirationDate, status };
    }
    else {
      const jobInfo = this.jobList[jobId];
      jobInfo.expirationDate = expirationDate;

      if (!([JobStatus.PDF_EXPORT_DONE, JobStatus.FAILED] as JobStatus[]).includes(jobInfo.status)) {
        jobInfo.status = status;
      }
    }

    if (status === JobStatus.FAILED) {
      this.jobList[jobId].currentStream?.destroy(new Error('job failed'));
    }

    if (isJobNew && status !== JobStatus.FAILED) {
      this.readHtmlAndConvertToPdfUntilFinish(jobId);
    }
  }

  getJobStatus(jobId: string): JobStatus {
    if (!(jobId in this.jobList)) return JobStatus.FAILED;
    return this.jobList[jobId].status;
  }

  cleanUpJobList(): void {
    const now = new Date();
    for (const jobId of Object.keys(this.jobList)) {
      const job = this.jobList[jobId];
      if (now > job.expirationDate && ([JobStatus.PDF_EXPORT_DONE, JobStatus.FAILED] as JobStatus[]).includes(job.status)) {
        job.currentStream?.destroy(new Error('job expired'));
        delete this.jobList[jobId];
      }
    }
  }


  private async readHtmlAndConvertToPdfUntilFinish(jobId: string): Promise<void> {
    while (!([JobStatus.PDF_EXPORT_DONE, JobStatus.FAILED] as JobStatus[]).includes(this.jobList[jobId].status)) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, 60 * 1000));

      try {
        if (new Date() > this.jobList[jobId].expirationDate) {
          throw new Error('Job expired');
        }

        const htmlReadable = this.getHtmlReadable(jobId);
        const pdfWritable = this.getPdfWritable();
        this.jobList[jobId].currentStream = htmlReadable;

        // eslint-disable-next-line no-await-in-loop
        await pipelinePromise(htmlReadable, pdfWritable);
      }
      catch (err) {
        logger.error('Failed to convert html to pdf', err);
        this.jobList[jobId].status = JobStatus.FAILED;
        this.jobList[jobId].currentStream?.destroy(new Error('Failed to convert html to pdf'));
        break;
      }
    }
  }

  private getHtmlReadable(jobId: string): Readable {
    const htmlFileEntries = fs.existsSync(path.join(this.tmpHtmlDir, jobId))
      ? fs.readdirSync(path.join(this.tmpHtmlDir, jobId), { recursive: true, withFileTypes: true }).filter(entry => entry.isFile()) : [];
    let index = 0;

    const jobList = this.jobList;

    return new Readable({
      objectMode: true,
      async read() {
        if (index >= htmlFileEntries.length) {
          if (jobList[jobId].status === JobStatus.HTML_EXPORT_DONE && htmlFileEntries.length === 0) {
            jobList[jobId].status = JobStatus.PDF_EXPORT_DONE;
          }
          this.push(null);
          return;
        }

        const entry = htmlFileEntries[index];
        const htmlFilePath = path.join(entry.parentPath, entry.name);
        const htmlString = await fs.promises.readFile(htmlFilePath, 'utf-8');

        this.push({ htmlString, htmlFilePath });

        index += 1;
      },
    });
  }

  private getPdfWritable(): Writable {
    return new Writable({
      objectMode: true,
      write: async(pageInfo: PageInfo, encoding, callback) => {
        const fileOutputPath = pageInfo.htmlFilePath.replace(new RegExp(`^${this.tmpHtmlDir}`), this.tmpOutputRootDir).replace(/\.html$/, '.pdf');
        const fileOutputParentPath = this.getParentPath(fileOutputPath);

        try {
          const pdfBody = await this.convertHtmlToPdf(pageInfo.htmlString);
          await fs.promises.mkdir(fileOutputParentPath, { recursive: true });
          await fs.promises.writeFile(fileOutputPath, pdfBody);

          await fs.promises.rm(pageInfo.htmlFilePath, { force: true });
        }
        catch (err) {
          callback(err instanceof Error ? err : new Error(String(err)));
          return;
        }
        callback();
      },
    });
  }

  private async convertHtmlToPdf(htmlString: string): Promise<Buffer> {
    const executeConvert = async(retries: number): Promise<Buffer> => {
      try {
        return this.puppeteerCluster?.execute(htmlString);
      }
      catch (err) {
        if (retries > 0) {
          logger.error('Failed to convert markdown to pdf. Retrying...', err);
          return executeConvert(retries - 1);
        }
        throw err;
      }
    };

    const result = await executeConvert(this.convertRetryLimit);

    return result;
  }

  private async initPuppeteerCluster(): Promise<void> {
    this.puppeteerCluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: this.maxConcurrency,
      workerCreationDelay: 10000,
    });

    await this.puppeteerCluster.task(async({ page, data: htmlString }) => {
      await page.setContent(htmlString, { waitUntil: 'domcontentloaded' });
      await page.emulateMediaType('screen');
      const pdfResult = await page.pdf({
        margin: {
          top: '100px', right: '50px', bottom: '100px', left: '50px',
        },
        printBackground: true,
        format: 'A4',
      });
      return pdfResult;
    });

    // close cluster on app termination
    const handleClose = async() => {
      logger.info('Closing puppeteer cluster...');
      await this.puppeteerCluster?.idle();
      await this.puppeteerCluster?.close();
      process.exit();
    };
    process.on('SIGINT', handleClose);
    process.on('SIGTERM', handleClose);
  }

  private getParentPath(path: string): string {
    const parentPath = path.split('/').slice(0, -1).join('/');
    if (parentPath === '' || parentPath === '/') {
      return '/';
    }
    return parentPath;
  }

}

const pdfConvertService = new PdfConvertService();

export default pdfConvertService;
