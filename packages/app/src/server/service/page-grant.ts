import mongoose from 'mongoose';

import UserGroup from '~/server/models/user-group';
import { PageModel, PageDocument } from '~/server/models/page';

class PageGrantService {

  crowi!: any;

  Page: PageModel;

  constructor(crowi: any) {
    this.crowi = crowi;
  }

  async validateByTestAncestor(target: PageDocument, testAncestor: PageDocument): Promise<boolean> {
    return false;
  }

  async validateByDescendant(target: PageDocument): Promise<boolean> {
    return false;
  }

  async pageCreateValidation(pathToCreate) {
    const Page = mongoose.model('Page');

    // try to find target
    const emptyTarget = await Page.findOne({ path: pathToCreate });

    if (emptyTarget == null) { // checking the parent is enough

    }

    // get grant, grantedUser, grantedGroup of the target
    // find the nearest parent excluding empty pages
    // find all descendants & collect all
  }

}

export default PageGrantService;
