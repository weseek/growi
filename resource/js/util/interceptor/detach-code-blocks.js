import { BasicInterceptor } from 'crowi-pluginkit';


class DetachCodeBlockUtil {
  static createReplaceStr(replaceId) {
    return `<pre>${replaceId}</pre>`;
  }
}

/**
 * The interceptor that detach code blocks
 */
export class DetachCodeBlockInterceptor extends BasicInterceptor {

  constructor(crowi) {
    super();
    this.crowi = crowi;
    this.crowiForJquery = crowi.getCrowiForJquery();
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return (
      contextName === 'prePreProcess'
    );
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    const context = Object.assign(args[0]);   // clone
    const markdown = context.markdown;
    const currentPagePath = context.currentPagePath;

    context.dcbContextMap = {};

    // see: https://regex101.com/r/8PAEcC/3
    context.markdown = markdown.replace(/((```|~~~)(.|[\r\n])*?(```|~~~))|(`[^\r\n]*?`)/gm, (all) => {
      // create ID
      const replaceId = 'dcb-' + this.createRandomStr(8);

      // register to context
      let dcbContext = {};
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
    const bag = "abcdefghijklmnopqrstuvwxyz0123456789";
    let generated = "";
    for (var i = 0; i < length; i++) {
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
    this.crowi = crowi;
    this.crowiForJquery = crowi.getCrowiForJquery();
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return (
      contextName === 'postPreProcess'
    );
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    const context = Object.assign(args[0]);   // clone

    // forEach keys of dcbContextMap
    Object.keys(context.dcbContextMap).forEach((replaceId) => {
      // get context object from context
      let dcbContext = context.dcbContextMap[replaceId];

      // replace it with content by using getter function so that the doller sign does not work
      // see: https://github.com/weseek/crowi-plus/issues/285
      context.markdown = context.markdown.replace(dcbContext.substituteContent, () => { return dcbContext.content; });
    });

    // resolve
    return Promise.resolve(context);
  }
}
