const generalErrorPhrase = 'Failed to parse TransferKey from string';

export class TransferKey {

  private static _internalSeperator = '__grw_internal_tranferkey__'

  public appUrl: URL

  public key: string

  constructor(appUrl: URL, key: string) {
    this.appUrl = appUrl;
    this.key = key;
  }

  static parse(str: string): TransferKey {
    const splitted = str.split(TransferKey._internalSeperator);

    if (splitted.length !== 2) {
      throw Error(generalErrorPhrase);
    }
    const appUrlString = splitted[0];
    const key = splitted[1];

    let appUrl: URL | null;
    try {
      appUrl = new URL(appUrlString);
    }
    catch (e) {
      throw Error(generalErrorPhrase + (e as Error));
    }

    return new TransferKey(appUrl, key);
  }

  static stringify(appUrl: URL, key: string): string {
    return `${appUrl.origin}${TransferKey._internalSeperator}${key}`;
  }

}
