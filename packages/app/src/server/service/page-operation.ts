// eslint-disable-next-line @typescript-eslint/ban-types
export type Resumer = [Function, any];

class PageOperationService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
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
