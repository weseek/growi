export default class MathJaxConfigurer {

  constructor(crowi) {
    this.crowi = crowi;

    const config = crowi.getConfig();
    this.isEnabled = !!config.env.MATHJAX; // convert to boolean
  }

  configure(md) {
    if (this.isEnabled) {
      md.use(require('markdown-it-mathjax')());
    }
  }

}
