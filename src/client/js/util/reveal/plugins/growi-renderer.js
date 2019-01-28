/**
 * reveal.js growi-renderer plugin.
 */
(function() {
  // put 'hoge' on each slide.
  let sections = document.querySelectorAll( '[data-markdown]'), section;
  for (let i = 0, len = sections.length; i < len; i++ ) {
    section = sections[i];
    let divElement = document.createElement('div');
    divElement.appendChild(
      document.createTextNode(section.getElementsByTagName('script')[0].innerText)
    );
    section.appendChild(divElement);
  }
  const GrowiRenderer = require('../../GrowiRenderer').default;
  // parent window DOM (crowi.js) of presentation window.
  let parentWindow = window.parent;
  let growiRenderer = new GrowiRenderer(parentWindow.crowi, parentWindow.crowiRenderer, {mode: 'editor'});
  growiRenderer.setup();
  // TODO: retract code block by GrowiRenderer in GC-1354.
}());
