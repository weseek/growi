import { IWorkflowApproverGroup } from '~/interfaces/workflow';
import Workflow from '~/server/models/workflow';
import loggerFactory from '~/utils/logger';

import Crowi from '../crowi';


const logger = loggerFactory('growi:service:workflow');


export default class WorkflowService {

  crowi!: Crowi;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
  }

  createWorkflow = async function(pageId: string, name: string, comment: string, workflowApproverGroups: IWorkflowApproverGroup[]) {
    const hasInprogressWorkflowInTargetPage = await Workflow.hasInprogressWorkflowInTargetPage(pageId);
    if (hasInprogressWorkflowInTargetPage) {
      throw Error('An in-progress workflow already exists');
    }

    return null;
  };


}

module.exports = WorkflowService;
