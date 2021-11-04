import { Response } from 'express';

export interface ApiV3Response extends Response {
  apiV3(): any
  apiV3Err(): any
}
