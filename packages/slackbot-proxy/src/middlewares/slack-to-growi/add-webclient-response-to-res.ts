import {
  IMiddleware, Middleware, Next, Req, Res,
} from '@tsed/common';


export type WebclientRes = Res & {
  webClient: ()=> void,
  webClientErr:(message?:string)=>void
};


@Middleware()
export class AddWebclientResponseToRes implements IMiddleware {

  use(@Req() req: Req, @Res() res: WebclientRes, @Next() next: Next): void {

    res.webClient = () => {
      return res.send({ ok: true });
    };

    res.webClientErr = (error?:string) => {
      return res.send({ ok: false, error });
    };

    next();
  }

}
