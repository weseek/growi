import { getIdForRef, type IPage, type IUser } from '@growi/core';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

import type { CrowiProperties } from '~/interfaces/crowi-request';
import { Attachment, IAttachmentDocument } from '~/server/models';
import ApiResponse from '~/server/util/apiResponse';


interface PageModel {
  isAccessiblePageByViewer: (pageId: string, user: IUser | undefined) => Promise<boolean>
}

type Req = CrowiProperties & Request<
  { id: string },
  undefined, undefined, undefined,
  { attachment?: IAttachmentDocument }
>;

type AttachmentReq = Request<
  undefined,
  undefined, undefined, undefined,
  { attachment: IAttachmentDocument }
>;

export const validateGetRequest = async(req: Req, res: Response, next: NextFunction): Promise<Response|void> => {
  const id = req.params.id;
  const attachment = await Attachment.findById(id);

  if (attachment == null) {
    return res.json(ApiResponse.error('attachment not found'));
  }

  const user = req.user;

  // check viewer has permission
  if (user != null && attachment.page != null) {
    const Page = mongoose.model<IPage, PageModel>('Page');
    const isAccessible = await Page.isAccessiblePageByViewer(getIdForRef(attachment.page), user);
    if (!isAccessible) {
      return res.json(ApiResponse.error(`Forbidden to access to the attachment '${attachment.id}'. This attachment might belong to other pages.`));
    }
  }

  return next();
};
