const mongoose = require('mongoose');
const ExportingProgress = require('./collection-progress');

class CollectionProgressingStatus {

  constructor() {
    this.totalCount = 0;

    this.progressList = null;
    this.progressMap = {};
  }

  async init(collections) {
    const promisesForCreatingInstance = collections.map(async(collectionName) => {
      const collection = mongoose.connection.collection(collectionName);
      const totalCount = await collection.count();
      return new ExportingProgress(collectionName, totalCount);
    });
    this.progressList = await Promise.all(promisesForCreatingInstance);

    // collection name to instance mapping
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
