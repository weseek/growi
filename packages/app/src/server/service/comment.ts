import loggerFactory from '../../utils/logger';

const logger = loggerFactory('growi:service:CommentService');


class CommentService {

  crowi!: any;

  constructor(crowi: any) {
    this.crowi = crowi;
  }

}

module.exports = CommentService;
