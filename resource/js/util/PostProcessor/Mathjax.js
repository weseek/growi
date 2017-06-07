
export default class Mathjax {

  constructor(crowi) {
    this.crowi = crowi;
    this.defaultUrl = '//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?skipStartupTypeset=true';

    this.mathJaxConfigured = false;

    const config = crowi.getConfig();

    if (config.env.MATHJAX) {
      this.mathJaxConfigured = true;

      if (crowi.window.MathJax) {
        return ;
      }

      const document = crowi.document;
      const head = document.getElementsByTagName('head')[0];

      const mathJaxConfig= document.createElement('script');
      mathJaxConfig.type = 'text/x-mathjax-config';
      mathJaxConfig.text = `MathJax.Hub.Config({
      extensions: ["tex2jax.js"],
      jax: ["input/TeX", "output/SVG"],
      tex2jax: {
        inlineMath: [ ['$','$'] ],
        displayMath: [ ['$$','$$'] ],
        processEscapes: true
      },
      showMathMenu: false,
      showMathMenuMSIE: false,
      showProcessingMessages: false,
      messageStyle: "none",
      skipStartupTypeset: true
    });`;
      head.appendChild(mathJaxConfig);

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = this.defaultUrl;

      head.appendChild(script);
    }

    this.process = this.process.bind(this);
  }

  process(html, dom) {
    if (!this.mathJaxConfigured) {
      return html;
    }

    const intervalId = setInterval(() => {
      if (this.crowi.window.MathJax) {
        const MathJax = this.crowi.window.MathJax;

        MathJax.Hub.Queue(["Typeset", MathJax.Hub, dom.id]);
        clearInterval(intervalId);
      }
    }, 100);

    return html;
  }
}
