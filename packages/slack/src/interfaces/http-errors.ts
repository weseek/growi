import { HttpError } from 'http-errors';

export class CustomHttpError extends Error {

  httpError: HttpError

  constructor(httpError: HttpError) {
    super(httpError.message);
    this.httpError = httpError;
  }

}
