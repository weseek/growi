module.exports = {
  js: [
    {
      name: 'basis',
      url: 'https://cdn.jsdelivr.net/combine/npm/emojione@3.1.2,npm/jquery@3.3.1,npm/bootstrap@3.3.7/dist/js/bootstrap.min.js',
      groups: ['basis'],
      args: {
        integrity: '',
      }
    },
    {
      name: 'highlight',
      url: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.12.0/build/highlight.min.js',
      groups: ['basis'],
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
        async: true,
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
      name: 'lato',
      url: 'https://fonts.googleapis.com/css?family=Lato:400,700',
      groups: ['basis'],
      args: {
        integrity: ''
      },
    },
    {
      name: 'font-awesome',
      url: 'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css',
      groups: ['basis'],
      args: {
        integrity: '',
      }
    },
    {
      name: 'themify-icons',
      url: 'https://cdn.jsdelivr.net/npm/cd-themify-icons@0.0.1/index.min.css',
      groups: ['basis'],
      args: {
        integrity: ''
      },
    },
    {
      name: 'simple-line-icons',
      url: 'https://cdn.jsdelivr.net/npm/simple-line-icons@2.4.1/css/simple-line-icons.min.css',
      groups: ['basis'],
      args: {
        integrity: ''
      },
    },
    {
      name: 'emojione',
      url: 'https://cdn.jsdelivr.net/npm/emojione@3.1.2/extras/css/emojione.min.css',
      groups: ['basis'],
      args: {
        integrity: ''
      },
    },
    {
      name: 'jquery-ui',
      url: 'https://cdn.jsdelivr.net/jquery.ui/1.11.4/jquery-ui.min.css',
      args: {
        integrity: ''
      },
    }
  ]
};
