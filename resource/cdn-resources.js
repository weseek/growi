module.exports = {
  js: [
    {
      name: 'basis',
      url: 'https://cdn.jsdelivr.net/combine/npm/emojione@3.1.2,npm/jquery@3.3.1,npm/bootstrap@3.3.7/dist/js/bootstrap.min.js',
      args: {
        integrity: '',
      }
    },
    {
      name: 'highlight',
      url: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.12.0/build/highlight.min.js',
      args: {
        integrity: '',
      }
    },
    {
      name: 'highlight-addons',
      url: 'https://cdn.jsdelivr.net/combine/' +
'gh/highlightjs/cdn-release@9.12.0/build/languages/dockerfile.min.js,' +
'gh/highlightjs/cdn-release@9.12.0/build/languages/go.min.js,' +
'gh/highlightjs/cdn-release@9.12.0/build/languages/gradle.min.js,' +
'gh/highlightjs/cdn-release@9.12.0/build/languages/json.min.js,' +
'gh/highlightjs/cdn-release@9.12.0/build/languages/less.min.js,' +
'gh/highlightjs/cdn-release@9.12.0/build/languages/scss.min.js,' +
'gh/highlightjs/cdn-release@9.12.0/build/languages/typescript.min.js,' +
'gh/highlightjs/cdn-release@9.12.0/build/languages/yaml.min.js',
      args: {
        defer: true,
        integrity: '',
      }
    },
    {
      name: 'mathjax',
      url: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js',
      args: {
        async: true,
        integrity: '',
      }
    }
  ],
  style: [
    {
      name: 'font-awesome',
      url: 'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css',
    },
  ]
};
