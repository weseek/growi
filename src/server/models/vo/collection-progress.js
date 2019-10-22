class ExportingProgress {

  constructor(collectionName, totalCount) {
    this.collectionName = collectionName;
    this.currentCount = 0;
    this.totalCount = totalCount;
  }

}

module.exports = ExportingProgress;
