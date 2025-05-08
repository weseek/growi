import { EventEmitter } from 'events';

import multerAutoreap from 'multer-autoreap';

interface MockRequest {
  file?: Express.Multer.File;
}

export const reapFileManually = (file: Express.Multer.File): void => {
  const mockReq: MockRequest = { file };
  const mockRes = new EventEmitter();

  (multerAutoreap)(mockReq, mockRes, () => {});
};
