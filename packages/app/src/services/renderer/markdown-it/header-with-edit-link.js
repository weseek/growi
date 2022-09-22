export default class HeaderWithEditLinkConfigurer {

  configure(md) {
    md.renderer.rules.heading_close = (tokens, idx) => {
      return `<span class="revision-head-edit-button">
                <a href="#edit" onClick="Crowi.setCaretLine(parseInt(this.parentNode.parentNode.dataset.line, 10))">
                  <i class="icon-note"></i>
                </a>
              </span></${tokens[idx].tag}>`;
    };
  }

}
