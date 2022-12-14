/* eslint-disable @next/next/google-font-display */
import React from 'react';

import type { ViteManifest } from '@growi/core';
import { DefaultThemeMetadata, PresetThemesMetadatas } from '@growi/preset-themes';
import mongoose from 'mongoose';
import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import { ActivatePluginService, GrowiPluginManifestEntries } from '~/client/services/activate-plugin';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import { GrowiPlugin, GrowiPluginResourceType } from '~/interfaces/plugin';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:page:_document');

type HeadersForThemesProps = {
  theme: string,
  presetThemesManifest: ViteManifest,
  pluginThemeHref: string | undefined,
}
const HeadersForThemes = (props: HeadersForThemesProps): JSX.Element => {
  const {
    theme, presetThemesManifest, pluginThemeHref,
  } = props;

  const elements: JSX.Element[] = [];

  // when plugin theme is specified
  if (pluginThemeHref != null) {
    elements.push(
      <link rel="stylesheet" key={`link_custom-themes-${theme}`} href={pluginThemeHref} />,
    );
  }
  // preset theme
  else {
    const themeMetadata = PresetThemesMetadatas.find(p => p.name === theme);
    const manifestKey = themeMetadata?.manifestKey ?? DefaultThemeMetadata.manifestKey;
    if (themeMetadata == null || !(themeMetadata.manifestKey in presetThemesManifest)) {
      logger.warn(`Use default theme because the key for '${theme} does not exist in preset-themes manifest`);
    }
    const href = `/static/preset-themes/${presetThemesManifest[manifestKey].file}`; // configured by express.static
    elements.push(
      <link rel="stylesheet" key={`link_preset-themes-${theme}`} href={href} />,
    );
  }

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
  theme: string,
  customCss: string;
  presetThemesManifest: ViteManifest,
  pluginThemeHref: string | undefined,
  pluginManifestEntries: GrowiPluginManifestEntries;
}
declare type GrowiDocumentInitialProps = DocumentInitialProps & GrowiDocumentProps;

class GrowiDocument extends Document<GrowiDocumentInitialProps> {

  static presetThemesManifest: ViteManifest;

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);
    const { crowi } = ctx.req as CrowiRequest<any>;
    const { configManager, customizeService } = crowi;

    const theme = configManager.getConfig('crowi', 'customize:theme');
    const customCss: string = customizeService.getCustomCss();

    // import preset-themes manifest
    if (this.presetThemesManifest == null) {
      this.presetThemesManifest = await import('@growi/preset-themes/dist/themes/manifest.json').then(imported => imported.default);
    }

    // retrieve plugin manifests
    const GrowiPlugin = mongoose.model<GrowiPlugin>('GrowiPlugin');
    const growiPlugins = await GrowiPlugin.find({ isEnabled: true });
    const pluginManifestEntries = await ActivatePluginService.retrievePluginManifestEntries(growiPlugins);
    const pluginThemeHref = await ActivatePluginService.retrieveThemeHref(growiPlugins, theme);

    return {
      ...initialProps,
      theme,
      customCss,
      presetThemesManifest: this.presetThemesManifest,
      pluginThemeHref,
      pluginManifestEntries,
    };
  }

  override render(): JSX.Element {
    const {
      customCss, theme, presetThemesManifest, pluginThemeHref, pluginManifestEntries,
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
          <HeadersForThemes theme={theme}
            presetThemesManifest={presetThemesManifest} pluginThemeHref={pluginThemeHref} />
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
