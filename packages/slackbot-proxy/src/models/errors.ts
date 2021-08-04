import ExtensibleCustomError from 'extensible-custom-error';

export class InvalidUrlError extends ExtensibleCustomError {

  constructor(url: string) {
    super(`Invalid URL: ${url}`);
  }

}
