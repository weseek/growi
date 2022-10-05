import React from 'react';

import fs from 'fs';

import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import { resolveFromRoot } from '~/utils/project-dir-utils';


interface GrowiDocumentProps {
  pluginsManifest: any;
}
declare type GrowiDocumentInitialProps = DocumentInitialProps & GrowiDocumentProps;

async function importPluginsManifest(): Promise<any> {
  const customManifestStr: string = await fs.readFileSync(resolveFromRoot('tmp/plugins/weseek/growi-plugin-jstest/dist/manifest.json'), 'utf-8');
  return {
    'growi-plugin-jstest': JSON.parse(customManifestStr),
  };
}

class GrowiDocument extends Document<GrowiDocumentProps> {

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);

    const pluginsManifest: any = await importPluginsManifest();

    return { ...initialProps, pluginsManifest };
  }

  override render(): JSX.Element {

    const { pluginsManifest } = this.props;

    return (
      <Html>
        <Head>
          {/*
          {renderScriptTagsByGroup('basis')}
          {renderStyleTagsByGroup('basis')}
          */}
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script type="module" src={`/plugins/weseek/growi-plugin-jstest/dist/${pluginsManifest['growi-plugin-jstest']['client-entry.tsx'].file}`} />
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
