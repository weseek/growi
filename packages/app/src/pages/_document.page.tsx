import React from 'react';

import fs from 'fs';

import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

// import { renderScriptTagsByGroup, renderStyleTagsByGroup } from '~/service/cdn-resources-loader';
import { resolveFromRoot } from '~/utils/project-dir-utils';

interface GrowiDocumentProps {
  bootJsPath: string;
}
declare type GrowiDocumentInitialProps = DocumentInitialProps & GrowiDocumentProps;

async function importCustomManifest(): Promise<any> {
  const customManifestStr: string = await fs.readFileSync(resolveFromRoot('.next/custom-manifest.json'), 'utf-8');
  return JSON.parse(customManifestStr);
}

class GrowiDocument extends Document<GrowiDocumentProps> {

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);

    const customManifest: any = await importCustomManifest();
    const bootJsPath = customManifest['boot.js'];

    return { ...initialProps, bootJsPath };
  }

  override render(): JSX.Element {

    const { bootJsPath } = this.props;

    return (
      <Html>
        <Head>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script src={bootJsPath}></script>
          {/*
          {renderScriptTagsByGroup('basis')}
          {renderStyleTagsByGroup('basis')}
          */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }

}

export default GrowiDocument;
