/* eslint-disable @next/next/google-font-display */
import React from 'react';

import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { IPluginService, GrowiPluginResourceEntries } from '~/server/service/plugin';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:page:_document');

type HeadersForGrowiPluginProps = {
  pluginResourceEntries: GrowiPluginResourceEntries;
}
const HeadersForGrowiPlugin = (props: HeadersForGrowiPluginProps): JSX.Element => {
  const { pluginResourceEntries } = props;

  return (
    <>
      { pluginResourceEntries.map(([installedPath, href]) => {
        if (href.endsWith('.js')) {
          // eslint-disable-next-line @next/next/no-sync-scripts
          return <script type="module" key={`script_${installedPath}`} src={href} />;
        }
        if (href.endsWith('.css')) {
          // eslint-disable-next-line @next/next/no-sync-scripts
          return <link rel="stylesheet" key={`link_${installedPath}`} href={href} />;
        }
        return <></>;
      }) }
    </>
  );
};

interface GrowiDocumentProps {
  themeHref: string,
  customScript: string | null,
  customCss: string | null,
  customNoscript: string | null,
  pluginResourceEntries: GrowiPluginResourceEntries;
}
declare type GrowiDocumentInitialProps = DocumentInitialProps & GrowiDocumentProps;

class GrowiDocument extends Document<GrowiDocumentInitialProps> {

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);
    const { crowi } = ctx.req as CrowiRequest<any>;
    const { customizeService, pluginService } = crowi;

    const { themeHref } = customizeService;
    const customScript: string | null = customizeService.getCustomScript();
    const customCss: string | null = customizeService.getCustomCss();
    const customNoscript: string | null = customizeService.getCustomNoscript();

    // retrieve plugin manifests
    const pluginResourceEntries = await (pluginService as IPluginService).retrieveAllPluginResourceEntries();

    return {
      ...initialProps,
      themeHref,
      customScript,
      customCss,
      customNoscript,
      pluginResourceEntries,
    };
  }

  renderCustomScript(customScript: string | null): JSX.Element {
    if (customScript == null || customScript.length === 0) {
      return <></>;
    }
    return <script id="customScript" dangerouslySetInnerHTML={{ __html: customScript }} />;
  }

  renderCustomCss(customCss: string | null): JSX.Element {
    if (customCss == null || customCss.length === 0) {
      return <></>;
    }
    return <style dangerouslySetInnerHTML={{ __html: customCss }} />;
  }

  renderCustomNoscript(customNoscript: string | null): JSX.Element {
    if (customNoscript == null || customNoscript.length === 0) {
      return <></>;
    }
    return <noscript dangerouslySetInnerHTML={{ __html: customNoscript }} />;
  }

  override render(): JSX.Element {
    const {
      customCss, customScript, customNoscript,
      themeHref, pluginResourceEntries,
    } = this.props;

    return (
      <Html>
        <Head>
          {this.renderCustomScript(customScript)}
          <link rel="stylesheet" key="link-theme" href={themeHref} />
          <HeadersForGrowiPlugin pluginResourceEntries={pluginResourceEntries} />
          {this.renderCustomCss(customCss)}
        </Head>
        <body>
          {this.renderCustomNoscript(customNoscript)}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }

}

export default GrowiDocument;
