class CollectionProgress {

  constructor(collectionName, totalCount) {
    this.collectionName = collectionName;
    this.currentCount = 0;
    this.insertedCount = 0;
    this.modifiedCount = 0;
    this.totalCount = totalCount;
  }

}

module.exports = CollectionProgress;
