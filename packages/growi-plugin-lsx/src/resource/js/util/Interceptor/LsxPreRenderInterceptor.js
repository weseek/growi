import React from 'react';
import ReactDOM from 'react-dom';

import BasicInterceptor from '../../../../lib/util/BasicInterceptor';

import { Lsx } from '../../components/Lsx';
import { LsxContext } from '../LsxContext';

/**
 * The interceptor for lsx
 *
 *  replace lsx tag to a React target element
 */
export class LsxPreRenderInterceptor extends BasicInterceptor {

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
      contextName === 'preRender' ||
      contextName === 'preRenderPreview'
    );
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    const context = Object.assign(args[0]);   // clone
    const markdown = context.markdown;
    const parsedHTML = context.parsedHTML;
    const currentPagePath = context.currentPagePath;

    context.lsxContextMap = {};

    // TODO retrieve from args for interceptor
    const fromPagePath = currentPagePath;

    // see: https://regex101.com/r/NQq3s9/2
    context.parsedHTML = parsedHTML.replace(/\$lsx\((.*)\)/g, (all, group1) => {
      const tagExpression = all;
      const lsxArgs = group1.trim();

      // create contexts
      let lsxContext = new LsxContext();
      lsxContext.currentPagePath = currentPagePath;
      lsxContext.tagExpression = tagExpression;
      lsxContext.fromPagePath = fromPagePath;
      lsxContext.lsxArgs = lsxArgs;

      // get cache container obj from sessionStorage
      // let lsxCache = JSON.parse(sessionStorage.getItem('lsx-cache'));
      // if (lsxCache) {
      //   lsxCache = Object.create(LsxCache, lsxCache);
      //   const cache = lsxCache.getItem(tagExpression);
      //   // check cache exists
      //   if (cache) {
      //     return cache;
      //   }
      // }

      const renderId = 'lsx-' + this.createRandomStr(8);
      lsxContext.renderId = renderId;

      context.lsxContextMap[renderId] = lsxContext;

      // return replace strings
      return this.createReactTargetDom(renderId, tagExpression);
    });

    // resolve
    return Promise.resolve(context);
  }

  createReactTargetDom(renderId, tagExpression) {
    return `<div id="${renderId}" />`;
  }

  /**
   * @see http://qiita.com/ryounagaoka/items/4736c225bdd86a74d59c
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
