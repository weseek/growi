import { BasicInterceptor } from 'growi-commons';

class DetachCodeBlockUtil {

  static createReplaceStr(replaceId) {
    return `<pre class="detached-code-block">${replaceId}</pre>`;
  }

}

/**
 * The interceptor that detach code blocks
 */
export class DetachCodeBlockInterceptor extends BasicInterceptor {

  constructor(crowi) {
    super();
    this.logger = require('@alias/logger')('growi:DetachCodeBlockInterceptor');

    this.crowi = crowi;
    this.crowiForJquery = crowi.getCrowiForJquery();
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return /^prePreProcess|prePostProcess$/.test(contextName);
  }

  getTargetKey(contextName) {
    if (contextName === 'prePreProcess') {
      return 'markdown';
    }
    if (contextName === 'prePostProcess') {
      return 'parsedHTML';
    }
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    this.logger.debug(`processing: 'contextName'=${contextName}`);

    const context = Object.assign(args[0]); // clone
    const targetKey = this.getTargetKey(contextName);
    const currentPagePath = context.currentPagePath; // eslint-disable-line no-unused-vars

    context.dcbContextMap = {};

    // see: https://regex101.com/r/8PAEcC/5
    // eslint-disable-next-line max-len
    context[targetKey] = context[targetKey].replace(/(^(```|~~~)(.|[\r\n])*?(```|~~~)$)|(`[^\r\n]*?`)|(<pre>(.|[\r\n])*?<\/pre>)|(<pre\s[^>]*>(.|[\r\n])*?<\/pre>)/gm, (all) => {
      // create ID
      const replaceId = `dcb-${this.createRandomStr(8)}`;
      this.logger.debug(`'replaceId'=${replaceId} : `, all);

      // register to context
      const dcbContext = {};
      dcbContext.content = all;
      dcbContext.substituteContent = DetachCodeBlockUtil.createReplaceStr(replaceId);
      context.dcbContextMap[replaceId] = dcbContext;

      // return substituteContent
      return dcbContext.substituteContent;
    });

    // resolve
    return Promise.resolve(context);
  }

  /**
   * @see http://qiita.com/ryounagaoka/items/4736c225bdd86a74d59c
   *
   * @param {number} length
   * @return random strings
   */
  createRandomStr(length) {
    const bag = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += bag[Math.floor(Math.random() * bag.length)];
    }
    return generated;
  }

}


/**
 * The interceptor that restore detached code blocks
 */
export class RestoreCodeBlockInterceptor extends BasicInterceptor {

  constructor(crowi) {
    super();
    this.logger = require('@alias/logger')('growi:DetachCodeBlockInterceptor');

    this.crowi = crowi;
    this.crowiForJquery = crowi.getCrowiForJquery();
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return /^postPreProcess|preRenderHtml|preRenderPreviewHtml|preRenderCommentHtml|preRenderCommentPreviewHtml$/.test(contextName);
  }

  getTargetKey(contextName) {
    if (contextName === 'postPreProcess') {
      return 'markdown';
    }
    if (contextName === 'preRenderHtml' || contextName === 'preRenderPreviewHtml'
        || contextName === 'preRenderCommentHtml' || contextName === 'preRenderCommentPreviewHtml') {
      return 'parsedHTML';
    }
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    this.logger.debug(`processing: 'contextName'=${contextName}`);

    const context = Object.assign(args[0]); // clone
    const targetKey = this.getTargetKey(contextName);

    // forEach keys of dcbContextMap
    Object.keys(context.dcbContextMap).forEach((replaceId) => {
      // get context object from context
      const dcbContext = context.dcbContextMap[replaceId];

      // replace it with content by using getter function so that the doller sign does not work
      // see: https://github.com/weseek/growi/issues/285
      context[targetKey] = context[targetKey].replace(dcbContext.substituteContent, () => { return dcbContext.content });
    });

    // resolve
    return Promise.resolve(context);
  }

}
