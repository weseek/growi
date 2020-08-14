import Document, { DocumentContext, DocumentInitialProps } from 'next/document';

class GrowiDocument extends Document {

  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);

    const { configManager } = ctx.req?.crowi;
    console.log(configManager.getConfig('crowi', 'customize:layout'));

    return initialProps;
  }

}

export default GrowiDocument;
