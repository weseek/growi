import {
  IMiddleware, Middleware, Next, Req, Res,
} from '@tsed/common';


export type WebclientRes = Res & {
  webClientErr: (message?:string, errorCode?:string) => void
};


@Middleware()
export class AddWebclientResponseToRes implements IMiddleware {

  use(@Req() req: Req, @Res() res: WebclientRes, @Next() next: Next): void {

    res.webClientErr = (error?:string, errorCode?:string) => {
      return res.send({ ok: false, error, errorCode });
    };

    next();
  }

}
