export default class MathJaxConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
  }

  configure(md) {
    md.use(require('markdown-it-mathjax')());
  }

}