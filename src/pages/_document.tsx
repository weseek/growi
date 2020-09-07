import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import fs from 'fs';
import path from 'path';

import { resolveFromRoot } from '~/utils/project-dir-utils';

interface GrowiDocumentProps {
  bootJsPath: string;
  layout: string;
}
declare type GrowiDocumentInitialProps = DocumentInitialProps & GrowiDocumentProps;

async function importCustomManifest(): Promise<any> {
  const customManifestStr: string = await fs.readFileSync(resolveFromRoot('.next/custom-manifest.json'), 'utf-8');
  return JSON.parse(customManifestStr);
}

class GrowiDocument extends Document<GrowiDocumentProps> {

  static async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);

    const customManifest: any = await importCustomManifest();
    const bootJsPath = path.join('/_next', customManifest['boot.js']);

    // const { configManager } = ctx.req?.crowi;

    // const layout = configManager.getConfig('crowi', 'customize:layout');

    return { ...initialProps, bootJsPath, layout: 'growi' };
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
