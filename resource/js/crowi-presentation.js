var Reveal = require('reveal.js');

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

  // Optional libraries used to extend on reveal.js
  dependencies: [
    { src: '/js/reveal/lib/js/classList.js', condition: function() { return !document.body.classList; } },
    { src: '/js/reveal/plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
    { src: '/js/reveal/plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
    { src: '/js/reveal/plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
    { src: '/js/reveal/plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
    { src: '/js/reveal/plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } }
  ]
});

Reveal.addEventListener('ready', function(event) {
  // event.currentSlide, event.indexh, event.indexv
  $('.reveal section').each(function(e) {
    var $self = $(this);
    if ($self.children().length == 1) {
      $self.addClass('only');
    }
  });
});
