class GrowiArchiveImportOption {

  constructor(collectionName, mode, initProps = {}) {
    this.collectionName = collectionName;
    this.mode = mode;

    Object.entries(initProps).forEach(([key, value]) => {
      this[key] = value;
    });
  }

}

module.exports = GrowiArchiveImportOption;
