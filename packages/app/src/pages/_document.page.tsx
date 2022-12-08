/* eslint-disable @next/next/google-font-display */
import React from 'react';

import mongoose from 'mongoose';
import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import { ActivatePluginService, GrowiPluginManifestEntries } from '~/client/services/activate-plugin';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { GrowiPlugin, GrowiPluginResourceType } from '~/interfaces/plugin';

const jsdom = require('jsdom');

const { JSDOM } = jsdom;

type HeadersForGrowiPluginProps = {
  pluginManifestEntries: GrowiPluginManifestEntries;
}

const HeadersForGrowiPlugin = (props: HeadersForGrowiPluginProps): JSX.Element => {
  const { pluginManifestEntries } = props;

  return (
    <>
      { pluginManifestEntries.map(([growiPlugin, manifest]) => {
        const { types } = growiPlugin.meta;

        const elements: JSX.Element[] = [];

        // add script
        if (types.includes(GrowiPluginResourceType.Script) || types.includes(GrowiPluginResourceType.Template)) {
          elements.push(<>
            {/* eslint-disable-next-line @next/next/no-sync-scripts */ }
            <script type="module" key={`script_${growiPlugin.installedPath}`}
              src={`/plugins/${growiPlugin.installedPath}/dist/${manifest['client-entry.tsx'].file}`} />
          </>);
        }
        // add link
        if (types.includes(GrowiPluginResourceType.Script) || types.includes(GrowiPluginResourceType.Style)) {
          elements.push(<>
            <link rel="stylesheet" key={`link_${growiPlugin.installedPath}`}
              href={`/plugins/${growiPlugin.installedPath}/dist/${manifest['client-entry.tsx'].css}`} />
          </>);
        }

        return elements;
      }) }
    </>
  );
};

interface GrowiDocumentProps {
  customCss: string;
  customHtmlHeaderStr: string;
  pluginManifestEntries: GrowiPluginManifestEntries;
}
declare type GrowiDocumentInitialProps = DocumentInitialProps & GrowiDocumentProps;

class GrowiDocument extends Document<GrowiDocumentInitialProps> {

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);
    const { crowi } = ctx.req as CrowiRequest<any>;
    const { customizeService, configManager } = crowi;
    const customCss: string = customizeService.getCustomCss() || '';
    const customHtmlHeaderStr: string = configManager.getConfig('crowi', 'customize:header') || '';

    const GrowiPlugin = mongoose.model<GrowiPlugin>('GrowiPlugin');
    const growiPlugins = await GrowiPlugin.find({ isEnabled: true });
    const pluginManifestEntries: GrowiPluginManifestEntries = await ActivatePluginService.retrievePluginManifests(growiPlugins);

    return {
      ...initialProps, customCss, customHtmlHeaderStr, pluginManifestEntries,
    };
  }

  override render(): JSX.Element {
    const { customCss, customHtmlHeaderStr, pluginManifestEntries } = this.props;

    const dom = new JSDOM(customHtmlHeaderStr, { runScripts: 'dangerously', resources: 'usable' });
    const customHtmlHeader = dom.window.document;


    return (
      <Html>
        <Head>
          {/* Error occurd
            Objects are not valid as a React child (found: [object Document]). If you meant to render a collection of children, use an array instead.
          */}
          {customHtmlHeader}
          <style>
            {customCss}
          </style>
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
          <HeadersForGrowiPlugin pluginManifestEntries={pluginManifestEntries} />
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
