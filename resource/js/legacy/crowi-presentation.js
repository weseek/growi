const Reveal = require('reveal.js');

require('reveal.js/css/reveal.css');
require('reveal.js/css/theme/black.css');
require('reveal.js/lib/js/head.min.js');
require('reveal.js/lib/js/html5shiv.js');

if (!window) {
  window = {};
}
window.Reveal = Reveal;

Reveal.initialize({
  controls: true,
  progress: true,
  history: true,
  center: true,
  transition: 'slide',

  //// This specification method can't be used
  ////   sice deleting symlink prevented `src` from being resolved -- 2017.06.15 Yuki Takei
  //
  // Optional libraries used to extend on reveal.js
  // dependencies: [
  //   { src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } },
  //   { src: 'plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
  //   { src: 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
  //   { src: 'plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
  //   { src: 'plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
  //   { src: 'plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } }
  // ]
});

require.ensure([], () => {
  require('reveal.js/lib/js/classList.js');
  require('reveal.js/plugin/markdown/marked.js');
  require('reveal.js/plugin/markdown/markdown.js');
  require('reveal.js/plugin/zoom-js/zoom.js');
  require('reveal.js/plugin/notes/notes.js');

  // fix https://github.com/weseek/crowi-plus/issues/96
  Reveal.slide(0, 0);
  Reveal.sync();
});

Reveal.addEventListener('ready', function(event) {
  // event.currentSlide, event.indexh, event.indexv
  $('.reveal section').each(function(e) {
    const $self = $(this);
    if ($self.children().length == 1) {
      $self.addClass('only');
    }
  });
});
