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

  private constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  static async create(
      configManager: ConfigManager,
      attachment: IAttachmentDocument,
      opts?: {
      inline?: boolean,
    },
  ): Promise<ContentHeaders> {

    // Create instance, passing the configManager to the private constructor
    const instance = new ContentHeaders(configManager);

    const attachmentContentType = attachment.fileFormat;
    const filename = attachment.originalName;

    const actualContentTypeString: string = attachmentContentType || 'application/octet-stream';

    instance.contentType = {
      field: 'Content-Type',
      value: actualContentTypeString,
    };

    const requestedInline = opts?.inline ?? false;
    const configKey = `attachments:contentDisposition:${actualContentTypeString}:inline` as ConfigKey;

    // AWAIT the config value here
    const rawConfigValue = await instance.configManager.getConfig(configKey); // Use instance's configManager

    let isConfiguredInline: boolean;
    if (typeof rawConfigValue === 'boolean') {
      isConfiguredInline = rawConfigValue;
    }
    else {
      isConfiguredInline = DEFAULT_ALLOWLIST_MIME_TYPES.has(actualContentTypeString);
    }

    const shouldBeInline = requestedInline
      && isConfiguredInline
      && SAFE_INLINE_CONFIGURABLE_MIME_TYPES.has(actualContentTypeString);

    instance.contentDisposition = {
      field: 'Content-Disposition',
      value: shouldBeInline
        ? 'inline'
        : `attachment;filename*=UTF-8''${encodeURIComponent(filename)}`,
    };

    instance.contentSecurityPolicy = {
      field: 'Content-Security-Policy',
      value: `script-src 'unsafe-hashes';
          style-src 'self' 'unsafe-inline';
          object-src 'none';
          require-trusted-types-for 'script';
          media-src 'self';
          default-src 'none';`,
    };

    instance.xContentTypeOptions = {
      field: 'X-Content-Type-Options',
      value: 'nosniff',
    };

    if (attachment.fileSize) {
      instance.contentLength = {
        field: 'Content-Length',
        value: attachment.fileSize.toString(),
      };
    }

    return instance;
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
