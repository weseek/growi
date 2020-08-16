import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import path from 'path';

import customManifest from '^/.next/custom-manifest.json';

class GrowiDocument extends Document {

  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);

    const { configManager } = ctx.req?.crowi;
    console.log(configManager.getConfig('crowi', 'customize:layout'));

    return initialProps;
  }

  render() {
    const bootJsPath = path.join('/_next', customManifest['boot.js']);

    return (
      <Html>
        <Head>
          <script src={bootJsPath}></script>
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
