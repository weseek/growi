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
          <link
            href="https://fonts.googleapis.com/css?family=Lato:400,700"
            rel="stylesheet"
          />
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
