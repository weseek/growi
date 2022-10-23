/* eslint-disable @next/next/google-font-display */
import React from 'react';

import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';


// type GrowiDocumentProps = {};
// declare type GrowiDocumentInitialProps = GrowiDocumentProps & DocumentInitialProps;
declare type GrowiDocumentInitialProps = DocumentInitialProps;


class GrowiDocument extends Document {

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  override render(): JSX.Element {

    return (
      <Html>
        <Head>
          {/*
          {renderScriptTagsByGroup('basis')}
          {renderStyleTagsByGroup('basis')}
          */}
          <link rel='preload' href="/static/fonts/PressStart2P-latin.woff2" as="font" type="font/woff2" />
          <link rel='preload' href="/static/fonts/PressStart2P-latin-ext.woff2" as="font" type="font/woff2" />
          <link rel='preload' href="/static/fonts/Lato-Regular-latin.woff2" as="font" type="font/woff2" />
          <link rel='preload' href="/static/fonts/Lato-Regular-latin-ext.woff2" as="font" type="font/woff2" />
          <link rel='preload' href="/static/fonts/Lato-Bold-latin.woff2" as="font" type="font/woff2" />
          <link rel='preload' href="/static/fonts/Lato-Bold-latin-ext.woff2" as="font" type="font/woff2" />
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
