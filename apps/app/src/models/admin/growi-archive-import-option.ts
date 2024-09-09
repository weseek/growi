export class GrowiArchiveImportOption {

  collectionName: string;

  mode: string;

  constructor(collectionName: string, mode: string, initProps = {}) {
    this.collectionName = collectionName;
    this.mode = mode;

    Object.entries(initProps).forEach(([key, value]) => {
      this[key] = value;
    });
  }

}
