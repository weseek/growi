import ExtensibleCustomError from 'extensible-custom-error';

export class InvalidUrlError extends ExtensibleCustomError {

  public url: string;

  constructor(url: string) {
    super();

    this.url = url;
    this.message = 'Invalid URL';
  }

}
