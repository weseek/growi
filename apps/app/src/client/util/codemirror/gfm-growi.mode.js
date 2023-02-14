// https://discuss.codemirror.net/t/cm-header-margin-padding-height/75/5
window.CodeMirror.defineMode('gfm-growi', (cmConfig, modeCfg) => {
  // based on Markdown (GitHub-flavour) mode
  // https://codemirror.net/doc/manual.html#option_mode
  // https://codemirror.net/mode/index.html
  modeCfg.name = 'gfm';
  modeCfg.highlightFormatting = true;
  const mode = window.CodeMirror.getMode(cmConfig, modeCfg);

  const origToken = mode.token;
  mode.token = function(stream, state) {
    let classes = origToken(stream, state) || '';
    // https://regex101.com/r/Fep0w2/1
    classes = classes.replace(/(^| )header(\S*)/g, '$1header$2 line-grw-cm-header-line');
    return /^\s*$/.test(classes) ? null : classes;
  };

  return mode;
});
