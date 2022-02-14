import {
  ResumeRenameArgs, ResumeDuplicateArgs, ResumeDeleteArgs, ResumeDeleteCompletelyArgs, ResumeRevertArgs,
  ResumeNormalizeParentArgs, ResumerArgs,
} from '~/server/interfaces/page-operation';
import PageService from '~/server/service/page';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Resumer = [Function, ResumerArgs];

class PageOperationService {

  crowi: any;

  pageService: typeof PageService

  constructor(crowi) {
    this.crowi = crowi;
    this.pageService = crowi.pageService;
  }

  async resumeAll(): Promise<void> {
    const resumers = await this.prepareResumers();

    await this.processResume(resumers);
  }

  private async prepareResumers(): Promise<Resumer[]> {
    return [];
  }

  private async processResume(resumers: Resumer[]): Promise<void> {
    return;
  }

}

export default PageOperationService;
