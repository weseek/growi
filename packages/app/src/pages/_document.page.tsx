import React from 'react';

import mongoose from 'mongoose';
import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import { Config } from '~/server/models/config';

type GrowiDocumentProps = {
  customizeHeaderDocument: Config
}
declare type GrowiDocumentInitialProps = GrowiDocumentProps & DocumentInitialProps;

class GrowiDocument extends Document<GrowiDocumentProps> {

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);

    const ConfigModel = mongoose.model('Config');
    const customizeHeaderDocument = await ConfigModel.findOne({ key: 'customize:header' }) as unknown as Config;

    return { ...initialProps, customizeHeaderDocument };
  }

  override render(): JSX.Element {

    const { customizeHeaderDocument } = this.props;

    return (
      <Html>
        <Head>
          {/*
          {renderScriptTagsByGroup('basis')}
          {renderStyleTagsByGroup('basis')}
          */}

          { JSON.parse(customizeHeaderDocument.value) }
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
