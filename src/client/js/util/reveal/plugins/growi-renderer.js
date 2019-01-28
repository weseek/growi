/**
 * reveal.js growi-renderer plugin.
 */
(function() {
  let SCRIPT_END_PLACEHOLDER = '__SCRIPT_END__';

  /**
   * Retrieves the markdown contents of a slide section
   * element. Normalizes leading tabs/whitespace.
   * Refered from The reveal.js markdown plugin.
   * https://github.com/hakimel/reveal.js/blob/master/plugin/markdown/markdown.js
   */
  function getMarkdownFromSlide( section ) {
    // look for a <script> or <textarea data-template> wrapper
    let template = section.querySelector( '[data-template]' ) || section.querySelector( 'script' );

    // strip leading whitespace so it isn't evaluated as code
    let text = ( template || section ).textContent;

    // restore script end tags
    text = text.replace( new RegExp( SCRIPT_END_PLACEHOLDER, 'g' ), '</script>' );

    let leadingWs = text.match( /^\n?(\s*)/ )[1].length;
    let leadingTabs = text.match( /^\n?(\t*)/ )[1].length;

    if (leadingTabs > 0) {
      text = text.replace( new RegExp('\\n?\\t{' + leadingTabs + '}', 'g'), '\n' );
    }
    else if (leadingWs > 1) {
      text = text.replace( new RegExp('\\n? {' + leadingWs + '}', 'g'), '\n' );
    }

    return text;
  }

  /**
   * Converts data-markdown slides to HTML slides by GrowiRenderer.
   */
  function convertSlides() {
    let sections = document.querySelectorAll( '[data-markdown]');
    let section;
    let markdown;
    for (let i = 0, len = sections.length; i < len; i++ ) {
      section = sections[i];

      // Only parse the same slide once
      if (!section.getAttribute('data-markdown-parsed')) {
        section.setAttribute('data-markdown-parsed', 'true');
        markdown = getMarkdownFromSlide(section);

        markdown = growiRenderer.preProcess(markdown);
        section.innerHTML = growiRenderer.process(markdown);
        section.innerHTML = growiRenderer.postProcess(section.innerHTML);
      }
    }
  }

  const GrowiRenderer = require('../../GrowiRenderer').default;
  // parent window DOM (crowi.js) of presentation window.
  let parentWindow = window.parent;

  // create GrowiRenderer instance and setup.
  let growiRenderer = new GrowiRenderer(parentWindow.crowi, parentWindow.crowiRenderer, {mode: 'editor'});
  growiRenderer.setup();
  // TODO: retract code block by GrowiRenderer in GC-1354.
  convertSlides();
}());
