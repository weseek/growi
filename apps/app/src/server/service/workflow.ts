import loggerFactory from '~/utils/logger';

import Crowi from '../crowi';

const logger = loggerFactory('growi:service:workflow');


export default class WorkflowService {

  crowi!: Crowi;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
  }

  createWorkflow = async function() {
    console.log('createWorkflow');
    return;
  };

}

module.exports = WorkflowService;
