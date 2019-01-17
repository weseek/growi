/**
 * reveal.js growi-renderer plugin.
 */
(function(root) {
  // put 'hoge' on each slide.
  let sections = document.querySelectorAll( '[data-markdown]'), section;
  for (let i = 0, len = sections.length; i < len; i++ ) {
    section = sections[i];
    // remove all existing children.
    while (section.firstChild) section.removeChild(section.firstChild);
    // add h1 DOM 'Hoge'.
    let h1 = document.createElement('h1');
    h1.appendChild(document.createTextNode('Hoge'));
    section.appendChild(h1);
  }
  const GrowiRenderer = require('../../GrowiRenderer');
  let growiRenderer = new GrowiRenderer(root.crowi, root.crowiRenderer, {mode: 'editor'});
  growiRenderer.setup();
  // TODO: retract code block by GrowiRenderer in GC-1354.
}(this));
