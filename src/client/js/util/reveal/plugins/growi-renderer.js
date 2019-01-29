import GrowiRenderer from '../../GrowiRenderer';

/**
 * reveal.js growi-renderer plugin.
 */
(function(root, factory) {
  // parent window DOM (crowi.js) of presentation window.
  let parentWindow = window.parent;

  // create GrowiRenderer instance and setup.
  let growiRenderer = new GrowiRenderer(parentWindow.crowi, parentWindow.crowiRenderer, {mode: 'editor'});
  growiRenderer.setup();

  let growiRendererPlugin = factory(growiRenderer);
  growiRendererPlugin.initialize();
}(this, function(growiRenderer) {
  const DEFAULT_SLIDE_SEPARATOR = '^\r?\n---\r?\n$';
  const DEFAULT_NOTES_SEPARATOR = 'notes?:';
  const SCRIPT_END_PLACEHOLDER = '__SCRIPT_END__';

  /**
   * Retrieves the markdown contents of a slide section
   * element. Normalizes leading tabs/whitespace.
   * Referred from The reveal.js markdown plugin.
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
   * Inspects the given options and fills out default
   * values for what's not defined.
   * Referred from The reveal.js markdown plugin.
   * https://github.com/hakimel/reveal.js/blob/master/plugin/markdown/markdown.js
   */
  function getSlidifyOptions( options ) {
    options = options || {};
    options.separator = options.separator || DEFAULT_SLIDE_SEPARATOR;
    options.notesSeparator = options.notesSeparator || DEFAULT_NOTES_SEPARATOR;
    options.attributes = options.attributes || '';

    return options;
  }

  /**
   * Helper function for constructing a markdown slide.
   * Referred from The reveal.js markdown plugin.
   * https://github.com/hakimel/reveal.js/blob/master/plugin/markdown/markdown.js
   */
  function createMarkdownSlide( content, options ) {
    options = getSlidifyOptions( options );

    // var notesMatch = content.split( new RegExp( options.notesSeparator, 'mgi' ) );

    // if( notesMatch.length === 2 ) {
    //   content = notesMatch[0] + '<aside class="notes">' + marked(notesMatch[1].trim()) + '</aside>';
    // }

    // prevent script end tags in the content from interfering
    // with parsing
    content = content.replace( /<\/script>/g, SCRIPT_END_PLACEHOLDER );

    return '<script type="text/template">' + content + '</script>';
  }

  function processSlides() {
    let sections = document.querySelectorAll( '[data-markdown]');
    let section;
    for (let i = 0, len = sections.length; i < len; i++) {
      section = sections[i];
      section.innerHTML = createMarkdownSlide( getMarkdownFromSlide( section ) );
    }
  }

  /**
   * Converts data-markdown slides to HTML slides by GrowiRenderer.
   */
  function convertSlides() {
    let sections = document.querySelectorAll( '[data-markdown]');
    let section;
    let markdown;
    for (let i = 0, len = sections.length; i < len; i++) {
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

  // API
  return {
    initialize: function() {
      processSlides();
      convertSlides();
    }
  };
}));
