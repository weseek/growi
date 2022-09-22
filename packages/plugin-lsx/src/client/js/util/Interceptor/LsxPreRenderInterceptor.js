import { customTagUtils, BasicInterceptor } from '@growi/core';
import ReactDOM from 'react-dom';

/**
 * The interceptor for lsx
 *
 *  replace lsx tag to a React target element
 */
export class LsxPreRenderInterceptor extends BasicInterceptor {

  constructor() {
    super();

    this.previousPreviewContext = null;
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return (
      contextName === 'preRenderHtml'
      || contextName === 'preRenderPreviewHtml'
    );
  }

  /**
   * @inheritdoc
   */
  isProcessableParallel() {
    return false;
  }

  /**
   * @inheritdoc
   */
  async process(contextName, ...args) {
    const context = Object.assign(args[0]); // clone
    const parsedHTML = context.parsedHTML;

    const tagPattern = /ls|lsx/;
    const result = customTagUtils.findTagAndReplace(tagPattern, parsedHTML);

    context.parsedHTML = result.html;
    context.lsxContextMap = result.tagContextMap;

    // unmount
    if (contextName === 'preRenderPreviewHtml') {
      this.unmountPreviousReactDOMs(context);
    }

    // resolve
    return context;
  }

  unmountPreviousReactDOMs(newContext) {
    if (this.previousPreviewContext != null) {
      // forEach keys of lsxContextMap
      Object.keys(this.previousPreviewContext.lsxContextMap).forEach((domId) => {
        const elem = document.getElementById(domId);
        ReactDOM.unmountComponentAtNode(elem);
      });
    }

    this.previousPreviewContext = newContext;
  }

}
