const CollectionProgress = require('./collection-progress');

class CollectionProgressingStatus {

  constructor(collections) {
    this.totalCount = 0;
    this.progressMap = {};

    this.progressList = collections.map((collectionName) => {
      return new CollectionProgress(collectionName, 0);
    });

    // collection name to instance mapping
    this.progressList.forEach((p) => {
      this.progressMap[p.collectionName] = p;
    });
  }

  recalculateTotalCount() {
    this.progressList.forEach((p) => {
      this.progressMap[p.collectionName] = p;
      this.totalCount += p.totalCount;
    });
  }

  get currentCount() {
    return this.progressList.reduce(
      (acc, crr) => acc + crr.currentCount,
      0,
    );
  }

}

module.exports = CollectionProgressingStatus;
