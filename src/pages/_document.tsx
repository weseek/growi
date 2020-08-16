import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import path from 'path';

interface GrowiDocumentProps {
  bootJsPath: string;
  layout: string;
}
declare type GrowiDocumentInitialProps = DocumentInitialProps & GrowiDocumentProps;

class GrowiDocument extends Document<GrowiDocumentProps> {

  static i = 0;

  static async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);

    const customManifest: any = await import('^/.next/custom-manifest.json');
    const bootJsPath = path.join('/_next', customManifest['boot.js']);

    const { configManager } = ctx.req?.crowi;

    const layout = configManager.getConfig('crowi', 'customize:layout');

    return { ...initialProps, bootJsPath, layout };
  }

  render(): JSX.Element {

    const { bootJsPath, layout } = this.props;

    return (
      <Html>
        <Head>
          <script src={bootJsPath}></script>
        </Head>
        <body className={layout}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }

}

export default GrowiDocument;
