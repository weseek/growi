// eslint-disable-next-line @typescript-eslint/ban-types
export type Resumer = [Function, any];

class PageOperationService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  /*
   * Block
   */

  /**
   * Check if the operation is processable by comparing the "path" with all PageOperation documents
   * @param path path to operate
   * @returns Promise<boolean>
   */
  async shouldBlock(path: string): Promise<boolean> {
    return true;
  }

  /*
   * Resume
   */

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
