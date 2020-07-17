/* eslint-disable import/prefer-default-export */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'unstated';
import { BasicInterceptor } from 'growi-commons';

import Drawio from '../../components/Drawio';

/**
 * The interceptor for draw.io
 *
 *  replace draw.io tag (render by markdown-it-drawio-viewer) to a React target element
 */
export class DrawioInterceptor extends BasicInterceptor {

  constructor(appContainer) {
    super();

    this.previousPreviewContext = null;
    this.appContainer = appContainer;

    // define callback function invoked by viewer.min.js of draw.io
    // refs: https://github.com/jgraph/drawio/blob/v12.9.1/etc/build/build.xml#L219-L232
    window.onDrawioViewerLoad = function() {
      const DrawioViewer = window.GraphViewer;

      if (DrawioViewer != null) {
        // disable useResizeSensor and checkVisibleState
        //   for preventing resize event by viewer.min.js
        DrawioViewer.useResizeSensor = false;
        DrawioViewer.prototype.checkVisibleState = false;

        // initialize
        DrawioViewer.processElements();
      }
    };
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return (
      contextName === 'preRenderHtml'
      || contextName === 'preRenderPreviewHtml'
      || contextName === 'postRenderHtml'
      || contextName === 'postRenderPreviewHtml'
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

    if (contextName === 'preRenderHtml' || contextName === 'preRenderPreviewHtml') {
      return this.drawioPreRender(contextName, context);
    }

    if (contextName === 'postRenderHtml' || contextName === 'postRenderPreviewHtml') {
      this.drawioPostRender(contextName, context);
      return;
    }
  }

  /**
   * @inheritdoc
   */
  createRandomStr(length) {
    const bag = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += bag[Math.floor(Math.random() * bag.length)];
    }
    return generated;
  }

  /**
   * @inheritdoc
   */
  drawioPreRender(contextName, context) {
    const div = document.createElement('div');
    div.innerHTML = context.parsedHTML;

    context.DrawioMap = {};
    Array.from(div.querySelectorAll('.mxgraph')).forEach((element) => {
      const domId = `mxgraph-${this.createRandomStr(8)}`;

      context.DrawioMap[domId] = {
        rangeLineNumberOfMarkdown: {
          beginLineNumber: element.parentNode.dataset.beginLineNumberOfMarkdown,
          endLineNumber: element.parentNode.dataset.endLineNumberOfMarkdown,
        },
        contentHtml: element.outerHTML,
      };
      element.outerHTML = `<div id="${domId}"></div>`;
    });
    context.parsedHTML = div.innerHTML;

    // unmount
    if (contextName === 'preRenderPreviewHtml') {
      this.unmountPreviousReactDOMs(context);
    }

    // resolve
    return context;
  }

  /**
   * @inheritdoc
   */
  drawioPostRender(contextName, context) {
    const isPreview = (contextName === 'postRenderPreviewHtml');

    Object.keys(context.DrawioMap).forEach((domId) => {
      const elem = document.getElementById(domId);
      if (elem) {
        this.renderReactDOM(context.DrawioMap[domId], elem, isPreview);
      }
    });
  }

  /**
   * @inheritdoc
   */
  renderReactDOM(drawioMapEntry, elem, isPreview) {
    ReactDOM.render(
      // eslint-disable-next-line react/jsx-filename-extension
      <Provider inject={[this.appContainer]}>
        <Drawio
          drawioContent={drawioMapEntry.contentHtml}
          isPreview={isPreview}
          rangeLineNumberOfMarkdown={drawioMapEntry.rangeLineNumberOfMarkdown}
        />
      </Provider>,
      elem,
    );
  }

  /**
   * @inheritdoc
   */
  unmountPreviousReactDOMs(newContext) {
    if (this.previousPreviewContext != null) {
      Array.from(document.querySelectorAll('.mxgraph')).forEach((element) => {
        ReactDOM.unmountComponentAtNode(element);
      });
    }

    this.previousPreviewContext = newContext;
  }

}
