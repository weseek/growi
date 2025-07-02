import type { Response } from 'express';

import type { ExpressHttpHeader, IContentHeaders } from '~/server/interfaces/attachment';
import type { IAttachmentDocument } from '~/server/models/attachment';
import type { ConfigManager } from '~/server/service/config-manager';

import type { ConfigKey } from '../../config-manager/config-definition';

import { DEFAULT_ALLOWLIST_MIME_TYPES, SAFE_INLINE_CONFIGURABLE_MIME_TYPES } from './security';


export class ContentHeaders implements IContentHeaders {

  contentType?: ExpressHttpHeader<'Content-Type'>;

  contentLength?: ExpressHttpHeader<'Content-Length'>;

  contentSecurityPolicy?: ExpressHttpHeader<'Content-Security-Policy'>;

  contentDisposition?: ExpressHttpHeader<'Content-Disposition'>;

  xContentTypeOptions?: ExpressHttpHeader<'X-Content-Type-Options'>;

  private configManager: ConfigManager;

  constructor(
      configManager: ConfigManager,
      attachment: IAttachmentDocument,
      opts?: {
      inline?: boolean,
    },
  ) {
    this.configManager = configManager;

    const attachmentContentType = attachment.fileFormat;
    const filename = attachment.originalName;

    // Define the final content type value in a local variable.
    const actualContentTypeString: string = attachmentContentType || 'application/octet-stream';

    this.contentType = {
      field: 'Content-Type',
      value: actualContentTypeString,
    };

    // Determine Content-Disposition based on allowlist and the 'inline' request flag
    const requestedInline = opts?.inline ?? false;

    const configKey = `attachments:contentDisposition:${actualContentTypeString}:inline` as ConfigKey;

    // Get current inline setting
    const rawConfigValue = this.configManager.getConfig(configKey);

    let isConfiguredInline: boolean;
    if (typeof rawConfigValue === 'boolean') {
      isConfiguredInline = rawConfigValue;
    }

    else {
      isConfiguredInline = DEFAULT_ALLOWLIST_MIME_TYPES.has(actualContentTypeString);
    }

    // Final decision
    const shouldBeInline = requestedInline
      && isConfiguredInline
      && SAFE_INLINE_CONFIGURABLE_MIME_TYPES.has(actualContentTypeString);

    this.contentDisposition = {
      field: 'Content-Disposition',
      value: shouldBeInline
        ? 'inline'
        : `attachment;filename*=UTF-8''${encodeURIComponent(filename)}`,
    };

    this.contentSecurityPolicy = {
      field: 'Content-Security-Policy',
      // eslint-disable-next-line max-len
      value: "script-src 'unsafe-hashes'; style-src 'self' 'unsafe-inline'; object-src 'none'; require-trusted-types-for 'script'; media-src 'self'; default-src 'none';",
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
