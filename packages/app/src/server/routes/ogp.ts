import {
  Request, Response,
} from 'express';

export const renderOgp = (req: Request, res: Response): Response => {
  console.log('This is the route to display the ogp image');
  console.log(req.params);

  if (req.params.pageId === '') {
    return res.status(400).send();
  }

  // TODO: GW-7369 OGP server にリクエスト、レスポンスの画像を pipe して返却できるようにする
  // TODO: pageId から path を解決、OGP image の表示判断を行う

  return res.status(200).send();
};
