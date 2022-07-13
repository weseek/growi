export default class MathJaxConfigurer {

  constructor(growiConfig) {
    this.isEnabled = !!growiConfig.env.MATHJAX; // convert to boolean
  }

  configure(md) {
    if (this.isEnabled) {
      md.use(require('markdown-it-mathjax')());
    }
  }

}
