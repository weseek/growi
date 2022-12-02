import {
  Request, Response,
} from 'express';

type Crowi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextApp: any,
}

type CrowiReq = Request & {
  crowi: Crowi,
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const delegator = (crowi: Crowi) => {

  const { nextApp } = crowi;
  const handle = nextApp.getRequestHandler();

  const delegateToNext = (req: CrowiReq, res: Response): void => {
    req.crowi = crowi;
    return handle(req, res);
  };

  return {
    delegateToNext,
  };

};

export default delegator;
