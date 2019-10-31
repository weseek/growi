class GrowiArchiveImportOption {

  constructor(mode, initProps = {}) {
    this.mode = mode;

    Object.entries(initProps).forEach(([key, value]) => {
      this[key] = value;
    });
  }

}

module.exports = GrowiArchiveImportOption;
