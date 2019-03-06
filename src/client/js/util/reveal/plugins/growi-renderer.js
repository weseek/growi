import GrowiRenderer from '../../GrowiRenderer';

/**
 * reveal.js growi-renderer plugin.
 */
(function(root, factory) {
  // parent window DOM (crowi.js) of presentation window.
  const parentWindow = window.parent;

  // create GrowiRenderer instance and setup.
  const growiRenderer = new GrowiRenderer(parentWindow.crowi, parentWindow.crowiRenderer, { mode: 'editor' });

  const growiRendererPlugin = factory(growiRenderer);
  growiRendererPlugin.initialize();
}(this, (growiRenderer) => {
  const DEFAULT_SLIDE_SEPARATOR = '^\r?\n---\r?\n$';


  const DEFAULT_ELEMENT_ATTRIBUTES_SEPARATOR = '\\\.element\\\s*?(.+?)$';


  const DEFAULT_SLIDE_ATTRIBUTES_SEPARATOR = '\\\.slide:\\\s*?(\\\S.+?)$';
  let marked;

  /**
   * Add data separator before lines
   * starting with '#' to markdown.
   */
  function divideSlides() {
    const sections = document.querySelectorAll('[data-markdown]');
    for (let i = 0, len = sections.length; i < len; i++) {
      const section = sections[i];
      const markdown = marked.getMarkdownFromSlide(section);
      const context = { markdown };
      const interceptorManager = growiRenderer.crowi.interceptorManager;
      let dataSeparator = section.getAttribute('data-separator') || DEFAULT_SLIDE_SEPARATOR;
      // replace string '\n' to LF code.
      dataSeparator = dataSeparator.replace(/\\n/g, '\n');
      const replaceValue = `${dataSeparator}#`;
      // detach code block.
      interceptorManager.process('prePreProcess', context);
      // if there is only '\n' in the first line, replace it.
      context.markdown = context.markdown.replace(/^\n/, '');
      // add data separator to markdown.
      context.markdown = context.markdown.replace(/[\n]+#/g, replaceValue);
      // restore code block.
      interceptorManager.process('postPreProcess', context);
      section.innerHTML = marked.createMarkdownSlide(context.markdown);
    }
  }

  /**
   * Converts data-markdown slides to HTML slides by GrowiRenderer.
   */
  function convertSlides() {
    const sections = document.querySelectorAll('[data-markdown]');
    let markdown;
    const interceptorManager = growiRenderer.crowi.interceptorManager;

    for (let i = 0, len = sections.length; i < len; i++) {
      const section = sections[i];

      // Only parse the same slide once
      if (!section.getAttribute('data-markdown-parsed')) {
        section.setAttribute('data-markdown-parsed', 'true');
        const notes = section.querySelector('aside.notes');
        markdown = marked.getMarkdownFromSlide(section);
        const context = { markdown };

        interceptorManager.process('preRender', context)
          .then(() => { return interceptorManager.process('prePreProcess', context) })
          .then(() => {
            context.markdown = growiRenderer.preProcess(context.markdown);
          })
          .then(() => { return interceptorManager.process('postPreProcess', context) })
          .then(() => {
            context.parsedHTML = growiRenderer.process(context.markdown);
          })
          .then(() => { return interceptorManager.process('prePostProcess', context) })
          .then(() => {
            context.parsedHTML = growiRenderer.postProcess(context.parsedHTML);
          })
          .then(() => { return interceptorManager.process('postPostProcess', context) })
          .then(() => { return interceptorManager.process('preRenderHtml', context) })
          .then(() => { return interceptorManager.process('postRenderHtml', context) })
          .then(() => {
            section.innerHTML = context.parsedHTML;
          });
        marked.addAttributes(section, section, null, section.getAttribute('data-element-attributes')
          || section.parentNode.getAttribute('data-element-attributes')
          || DEFAULT_ELEMENT_ATTRIBUTES_SEPARATOR,
        section.getAttribute('data-attributes')
          || section.parentNode.getAttribute('data-attributes')
          || DEFAULT_SLIDE_ATTRIBUTES_SEPARATOR);

        // If there were notes, we need to re-add them after
        // having overwritten the section's HTML
        if (notes) {
          section.appendChild(notes);
        }
      }
    }
  }

  // API
  return {
    async initialize() {
      growiRenderer.setup();
      marked = require('./markdown').default(growiRenderer.process);
      divideSlides();
      marked.processSlides();
      convertSlides();
    },
  };
}));
