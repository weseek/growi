class PageOperationService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * Check if the operation is processable by comparing the "path" with all PageOperation documents
   * @param path path to operate
   * @returns Promise<boolean>
   */
  async shouldBlock(path: string): Promise<boolean> {
    return true;
  }

}

export default PageOperationService;
