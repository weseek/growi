//import markdownItMermaid from 'markdown-it-mermaid';

export default class MermaidConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
    const config = crowi.getConfig();
    this.isEnabled = !!config.env.MERMAID;
  }

  configure(md) {
    //if (this.isEnabled) {
	  //   md.use(markdownItMermaid);
    //}
  }
}
