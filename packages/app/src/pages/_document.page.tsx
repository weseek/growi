/* eslint-disable @next/next/google-font-display */
import React from 'react';

import type { PresetThemesManifest } from '@growi/preset-themes';
import { getManifestKeyFromTheme } from '@growi/preset-themes';
import mongoose from 'mongoose';
import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import { ActivatePluginService, GrowiPluginManifestEntries } from '~/client/services/activate-plugin';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import { GrowiPlugin, GrowiPluginResourceType } from '~/interfaces/plugin';
import type { GrowiThemes } from '~/interfaces/theme';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:page:_document');

type HeadersForPresetThemesProps = {
  theme: GrowiThemes,
  manifest: PresetThemesManifest,
}
const HeadersForPresetThemes = (props: HeadersForPresetThemesProps): JSX.Element => {
  const { theme, manifest } = props;

  let themeKey = getManifestKeyFromTheme(theme);
  if (!(themeKey in manifest)) {
    logger.warn(`The key for '${theme} does not exist in preset-themes manifest`);
    themeKey = getManifestKeyFromTheme('default');
  }
  const href = `/static/preset-themes/${manifest[themeKey].file}`; // configured by express.static

  const elements: JSX.Element[] = [];

  elements.push(
    <link rel="stylesheet" key={`link_preset-themes-${theme}`} href={href} />,
  );

  return <>{elements}</>;
};

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
              src={`/static/plugins/${growiPlugin.installedPath}/dist/${manifest['client-entry.tsx'].file}`} />
          </>);
        }
        // add link
        if (types.includes(GrowiPluginResourceType.Script) || types.includes(GrowiPluginResourceType.Style)) {
          elements.push(<>
            <link rel="stylesheet" key={`link_${growiPlugin.installedPath}`}
              href={`/static/plugins/${growiPlugin.installedPath}/dist/${manifest['client-entry.tsx'].css}`} />
          </>);
        }

        return elements;
      }) }
    </>
  );
};

interface GrowiDocumentProps {
  theme: GrowiThemes,
  customCss: string;
  presetThemesManifest: PresetThemesManifest,
  pluginManifestEntries: GrowiPluginManifestEntries;
}
declare type GrowiDocumentInitialProps = DocumentInitialProps & GrowiDocumentProps;

class GrowiDocument extends Document<GrowiDocumentInitialProps> {

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);
    const { crowi } = ctx.req as CrowiRequest<any>;
    const { configManager, customizeService } = crowi;

    const theme = configManager.getConfig('crowi', 'customize:theme');
    const customCss: string = customizeService.getCustomCss();

    // import preset-themes manifest
    const presetThemesManifest = await import('@growi/preset-themes/dist/themes/manifest.json').then(imported => imported.default);

    // retrieve plugin manifests
    const GrowiPlugin = mongoose.model<GrowiPlugin>('GrowiPlugin');
    const growiPlugins = await GrowiPlugin.find({ isEnabled: true });
    const pluginManifestEntries: GrowiPluginManifestEntries = await ActivatePluginService.retrievePluginManifests(growiPlugins);

    return {
      ...initialProps, theme, customCss, presetThemesManifest, pluginManifestEntries,
    };
  }

  override render(): JSX.Element {
    const {
      customCss, theme, presetThemesManifest, pluginManifestEntries,
    } = this.props;

    return (
      <Html>
        <Head>
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
          <HeadersForPresetThemes theme={theme} manifest={presetThemesManifest} />
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
