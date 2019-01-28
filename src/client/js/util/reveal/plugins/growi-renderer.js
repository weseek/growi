/**
 * reveal.js growi-renderer plugin.
 */
(function() {
  /**
   * convert data-markdown slides to HTML slides by GrowiRenderer.
   */
  function convertSlides() {
    let sections = document.querySelectorAll( '[data-markdown]');
    let section;
    let template;
    let markdown;
    let parsedHTML;
    for (let i = 0, len = sections.length; i < len; i++ ) {
      section = sections[i];

      // Only parse the same slide once
      if (!section.getAttribute('data-markdown-parsed')) {
        section.setAttribute('data-markdown-parsed', true);
        // look for a <script> or <textarea data-template> wrapper
        template = section.querySelector('[data-template]') || section.querySelector('script');
        markdown = template.textContent;

        parsedHTML = growiRenderer.process(markdown);
        section.innerHTML = parsedHTML;
      }
    }
  }

  const GrowiRenderer = require('../../GrowiRenderer').default;
  // parent window DOM (crowi.js) of presentation window.
  let parentWindow = window.parent;

  // generate GrowiRenderer instance and setup.
  let growiRenderer = new GrowiRenderer(parentWindow.crowi, parentWindow.crowiRenderer, {mode: 'editor'});
  growiRenderer.setup();
  // TODO: retract code block by GrowiRenderer in GC-1354.
  convertSlides();
}());
