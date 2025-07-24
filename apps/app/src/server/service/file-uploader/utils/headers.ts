import type { Response } from 'express';

import type { ExpressHttpHeader, IContentHeaders } from '~/server/interfaces/attachment';
import type { IAttachmentDocument } from '~/server/models/attachment';

import { configManager } from '../../config-manager';


export class ContentHeaders implements IContentHeaders {

  contentType?: ExpressHttpHeader<'Content-Type'>;

  contentLength?: ExpressHttpHeader<'Content-Length'>;

  contentSecurityPolicy?: ExpressHttpHeader<'Content-Security-Policy'>;

  contentDisposition?: ExpressHttpHeader<'Content-Disposition'>;

  xContentTypeOptions?: ExpressHttpHeader<'X-Content-Type-Options'>;

  constructor(
      attachment: IAttachmentDocument,
      opts?: {
        inline?: boolean,
    },
  ) {
    const attachmentContentType = attachment.fileFormat;
    const filename = attachment.originalName;

    const actualContentTypeString: string = attachmentContentType || 'application/octet-stream';

    this.contentType = {
      field: 'Content-Type',
      value: actualContentTypeString,
    };

    const requestedInline = opts?.inline ?? false;
    const mimeTypeDefaults = configManager.getConfig('attachments:contentDisposition:mimeTypeDefaults') as Record<string, 'inline' | 'attachment'>;

    let systemAllowsInline: boolean;
    const defaultDispositionForType = mimeTypeDefaults[actualContentTypeString];

    if (defaultDispositionForType === 'inline') {
      systemAllowsInline = true;
    }
    else {
      systemAllowsInline = false;
    }

    // Determine the final disposition based on user request and system allowance
    const finalDispositionValue: 'inline' | 'attachment' = (requestedInline && systemAllowsInline) ? 'inline' : 'attachment';

    this.contentDisposition = {
      field: 'Content-Disposition',
      value: finalDispositionValue === 'inline'
        ? 'inline'
        : `attachment;filename*=UTF-8''${encodeURIComponent(filename)}`,
    };

    this.contentSecurityPolicy = {
      field: 'Content-Security-Policy',
      value: "script-src 'unsafe-hashes';"
         + " style-src 'self' 'unsafe-inline';"
         + " object-src 'none';"
         + " require-trusted-types-for 'script';"
         + " media-src 'self';"
         + " default-src 'none';",
    };

    this.xContentTypeOptions = {
      field: 'X-Content-Type-Options',
      value: 'nosniff',
    };

    if (attachment.fileSize) {
      this.contentLength = {
        field: 'Content-Length',
        value: attachment.fileSize.toString(),
      };
    }
  }

  /**
   * Convert to ExpressHttpHeader[]
   */
  toExpressHttpHeaders(): ExpressHttpHeader[] {
    return [
      this.contentType,
      this.contentLength,
      this.contentSecurityPolicy,
      this.contentDisposition,
      this.xContentTypeOptions,
    ]
      // exclude undefined
      .filter((member): member is NonNullable<typeof member> => member != null);
  }

}

/**
 * Convert Record to ExpressHttpHeader[]
 */
export const toExpressHttpHeaders = (records: Record<string, string | string[]>): ExpressHttpHeader[] => {
  return Object.entries(records).map(([field, value]) => { return { field, value } });
};

export const applyHeaders = (res: Response, headers: ExpressHttpHeader[]): void => {
  headers.forEach((header) => {
    res.header(header.field, header.value);
  });
};
