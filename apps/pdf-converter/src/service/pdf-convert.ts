import { Logger } from '@tsed/common';
import { Inject, Service } from '@tsed/di';
import { Cluster } from 'puppeteer-cluster';
import { Readable, Writable } from 'stream';
import fs from 'fs';
import path from 'path';
import { pipeline as pipelinePromise } from 'stream/promises';

interface PageInfo {
  htmlString: string;
  htmlFilePath: string;
}

export enum JobStatus {
  HTML_EXPORT_IN_PROGRESS = 'HTML_EXPORT_IN_PROGRESS',
  HTML_EXPORT_DONE = 'HTML_EXPORT_DONE',
  PDF_EXPORT_DONE = 'PDF_EXPORT_DONE',
  FAILED = 'FAILED',
}

export type JobStatusSharedWithGrowi = JobStatus.HTML_EXPORT_IN_PROGRESS | JobStatus.HTML_EXPORT_DONE | JobStatus.FAILED;

interface JobInfo {
  expirationDate: Date;
  status: JobStatus;
  currentStream?: Readable;
}

@Service()
class PdfConvertService {

  private puppeteerCluster: Cluster | undefined;

  private maxConcurrency = 1;

  private convertRetryLimit = 5;

  private tmpOutputRootDir = '/tmp/page-bulk-export';

  private tmpHtmlDir = `${this.tmpOutputRootDir}/html`;

  private jobList: {
    [key: string]: JobInfo;
  } = {};

  @Inject()
    logger: Logger;

  constructor() {
    this.initPuppeteerCluster();
  }

  registerOrUpdateJob(jobId: string, expirationDate: Date, status: JobStatusSharedWithGrowi): void {
    const isJobNew = !(jobId in this.jobList);

    if (isJobNew) {
      this.jobList[jobId] = { expirationDate, status };
    } else {
      const jobInfo = this.jobList[jobId];
      jobInfo.expirationDate = expirationDate;

      if (![JobStatus.PDF_EXPORT_DONE, JobStatus.FAILED].includes(jobInfo.status)) {
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
    if (!(jobId in this.jobList)) throw new Error('Job not found');
    return this.jobList[jobId].status;
  }

  private async readHtmlAndConvertToPdfUntilFinish(jobId: string): Promise<void> {
    while(![JobStatus.PDF_EXPORT_DONE, JobStatus.FAILED].includes(this.jobList[jobId].status)) {
      await new Promise(resolve => setTimeout(resolve, 60 * 1000));

      try {
        if (new Date() > this.jobList[jobId].expirationDate) {
          throw new Error('Job expired');
        }

        const htmlReadable = this.getHtmlReadable(jobId);
        const pdfWritable = this.getPdfWritable();
        this.logger.info(`execute pipeline for job ${jobId}`);
        this.jobList[jobId].currentStream = htmlReadable;

        await pipelinePromise(htmlReadable, pdfWritable);
      }
      catch (err) {
        this.logger.error('Failed to convert html to pdf', err);
        this.jobList[jobId].status = JobStatus.FAILED;
        this.jobList[jobId].currentStream?.destroy(new Error('Failed to convert html to pdf'));
        break;
      }
    }
    this.logger.info('終わりましたーーー');
  }

  private getHtmlReadable(jobId: string): Readable {
    const htmlFileEntries = fs.readdirSync(path.join(this.tmpHtmlDir, jobId), {recursive: true, withFileTypes: true}).filter(entry => entry.isFile());
    this.logger.info(htmlFileEntries.length);
    let index = 0;

    const jobList = this.jobList;
    const logger = this.logger;

    return new Readable({
      objectMode: true,
      async read() {
        logger.info('ここでも開始');
        if (index >= htmlFileEntries.length) {
          if (jobList[jobId].status === JobStatus.HTML_EXPORT_DONE && htmlFileEntries.length === 0) {
            jobList[jobId].status = JobStatus.PDF_EXPORT_DONE;
          }
          this.push(null);
          return;
        }
        logger.info('超えたー');

        const entry = htmlFileEntries[index];
        logger.info(entry);
        logger.info(entry.parentPath);
        logger.info(entry.name);
        const htmlFilePath = path.join(entry.parentPath, entry.name);
        const htmlString = await fs.promises.readFile(htmlFilePath, 'utf-8');
        logger.info('read html string');

        this.push({ htmlString, htmlFilePath });

        logger.info('pushed');
        index += 1;
      }
    });
  }

  private getPdfWritable(): Writable {
    return new Writable({
      objectMode: true,
      write: async(pageInfo: PageInfo, encoding, callback) => {
        const fileOutputPath = pageInfo.htmlFilePath.replace(new RegExp(`^${this.tmpHtmlDir}`), this.tmpOutputRootDir).replace(/\.html$/, '.pdf');
        const fileOutputParentPath = this.getParentPath(fileOutputPath);

        try {
          this.logger.info('fileOutputPath: ', fileOutputPath);
          this.logger.info('fileOutputParentPath: ', fileOutputParentPath);
          this.logger.info('htmlFilePath: ', pageInfo.htmlFilePath);
          const pdfBody = await this.convertHtmlToPdf(pageInfo.htmlString);
          await fs.promises.mkdir(fileOutputParentPath, { recursive: true });
          await fs.promises.writeFile(fileOutputPath, pdfBody);

          await fs.promises.rm(pageInfo.htmlFilePath, { force: true });
          this.logger.info('wrote');
        }
        catch (err) {
          callback(err);
          return;
        }
        callback();
      },
    });
  }

  private async convertHtmlToPdf(htmlString: string): Promise<Buffer> {
    const executeConvert = async(retries: number) => {
      try {
        return this.puppeteerCluster.execute(htmlString);
      }
      catch (err) {
        if (retries > 0) {
          this.logger.error('Failed to convert markdown to pdf. Retrying...', err);
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
      this.logger.info('Closing puppeteer cluster...');
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

export default PdfConvertService;
