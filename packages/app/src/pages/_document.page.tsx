import React from 'react';

import mongoose from 'mongoose';
import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import { Config } from '~/server/models/config';

type GrowiDocumentProps = {
  customizeHeaderDocument: Config | null
}
declare type GrowiDocumentInitialProps = GrowiDocumentProps & DocumentInitialProps;

class GrowiDocument extends Document<GrowiDocumentProps> {

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);

    const ConfigModel = mongoose.model('Config');
    const foundCustomizeHeaderDocument = await ConfigModel.findOne({ key: 'customize:header' });
    const customizeHeaderDocument = foundCustomizeHeaderDocument != null ? foundCustomizeHeaderDocument as unknown as Config : null;

    return { ...initialProps, customizeHeaderDocument };
  }

  override render(): JSX.Element {

    const { customizeHeaderDocument } = this.props;

    const customizeHeader = customizeHeaderDocument != null ? JSON.parse(customizeHeaderDocument.value) : '';

    return (
      <Html>
        <Head>
          {/*
          {renderScriptTagsByGroup('basis')}
          {renderStyleTagsByGroup('basis')}
          */}

          { customizeHeader }
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
