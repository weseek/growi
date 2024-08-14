// eslint-disable-next-line no-restricted-imports
import axios from 'axios';

import { PageBulkExportFormat, PageBulkExportJobStatus } from '../../../src/features/page-bulk-export/interfaces/page-bulk-export';
import PageBulkExportJob from '../../../src/features/page-bulk-export/server/models/page-bulk-export-job';
import { configManager } from '../../../src/server/service/config-manager';
import { getInstance } from '../setup-crowi';

const spyAxiosGet = jest.spyOn<typeof axios, 'get'>(
  axios,
  'get',
);

const spyAxiosPost = jest.spyOn<typeof axios, 'post'>(
  axios,
  'post',
);

describe('PageBulkExportJobCronService', () => {
  let crowi;
  let user;

  beforeAll(async() => {
    await configManager.loadConfigs();
    await configManager.updateConfigsInTheSameNamespace('crowi', { 'app:fileUploadType': 'aws' });

    crowi = await getInstance();
    const User = crowi.model('User');
    user = await User.create({
      name: 'Example for PageBulkExportJobCronService Test',
      username: 'page bulk export job cron test user',
      email: 'bulkExportCronTestUser@example.com',
      password: 'usertestpass',
      createdAt: '2020-01-01',
    });
  });

  beforeEach(async() => {
    await PageBulkExportJob.deleteMany();
  });

  // describe('deleteDownloadExpiredExportJobs', () => {
  //   beforeAll(async() => {
  //     await configManager.updateConfigsInTheSameNamespace('crowi', { 'app:bulkExportDownloadExpirationSeconds': 86400 }); // 1 day
  //   });
  // });

  describe('deleteFailedExportJobs', () => {
    beforeAll(async() => {
      await configManager.updateConfigsInTheSameNamespace('crowi', { 'app:bulkExportDownloadExpirationSeconds': 86400 }); // 1 day

      await PageBulkExportJob.insertMany([
        {
          user, page: '/test-path1', format: PageBulkExportFormat.md, status: PageBulkExportJobStatus.failed,
        },
        {
          user, page: '/test-path2', format: PageBulkExportFormat.md, status: PageBulkExportJobStatus.initializing,
        },
        {
          user, page: '/test-path3', format: PageBulkExportFormat.md, status: PageBulkExportJobStatus.failed,
        },
      ]);
    });

    test('should delete failed export jobs', async() => {
      expect(await PageBulkExportJob.find()).toHaveLength(2);
      const pageBulkExportJobCronService = crowi.pageBulkExportJobCronService;
      await pageBulkExportJobCronService.deleteFailedExportJobs();

      expect(await PageBulkExportJob.find()).toHaveLength(1);
    });
  });
});
