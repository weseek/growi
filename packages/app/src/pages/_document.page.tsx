/* eslint-disable @next/next/google-font-display */
import React from 'react';

import type { ViteManifest } from '@growi/core';
import { DefaultThemeMetadata, PresetThemesMetadatas } from '@growi/preset-themes';
import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { IPluginService, GrowiPluginResourceEntries } from '~/server/service/plugin';
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
  pluginResourceEntries: GrowiPluginResourceEntries;
}
const HeadersForGrowiPlugin = (props: HeadersForGrowiPluginProps): JSX.Element => {
  const { pluginResourceEntries } = props;

  return (
    <>
      { pluginResourceEntries.map(([installedPath, href]) => {
        if (href.endsWith('.js')) {
          // eslint-disable-next-line @next/next/no-sync-scripts
          return <script type="module" key={`script_${installedPath}`} src={href} />;
        }
        if (href.endsWith('.css')) {
          // eslint-disable-next-line @next/next/no-sync-scripts
          return <link rel="stylesheet" key={`link_${installedPath}`} href={href} />;
        }
        return <></>;
      }) }
    </>
  );
};

interface GrowiDocumentProps {
  theme: string,
  customScript: string | null,
  customCss: string | null,
  customNoscript: string | null,
  presetThemesManifest: ViteManifest,
  pluginThemeHref: string | undefined,
  pluginResourceEntries: GrowiPluginResourceEntries;
}
declare type GrowiDocumentInitialProps = DocumentInitialProps & GrowiDocumentProps;

class GrowiDocument extends Document<GrowiDocumentInitialProps> {

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);
    const { crowi } = ctx.req as CrowiRequest<any>;
    const { configManager, customizeService, pluginService } = crowi;

    // document exists but there is no repository, reinstall the plugins
    await (pluginService as IPluginService).intallNotExistPluginRepositories();

    const theme = configManager.getConfig('crowi', 'customize:theme');
    const customScript: string | null = customizeService.getCustomScript();
    const customCss: string | null = customizeService.getCustomCss();
    const customNoscript: string | null = customizeService.getCustomNoscript();

    // import preset-themes manifest
    const presetThemesManifest = await import('@growi/preset-themes/dist/themes/manifest.json').then(imported => imported.default);

    // retrieve plugin manifests
    const pluginResourceEntries = await (pluginService as IPluginService).retrieveAllPluginResourceEntries();
    const pluginThemeHref = await (pluginService as IPluginService).retrieveThemeHref(theme);

    return {
      ...initialProps,
      theme,
      customScript,
      customCss,
      customNoscript,
      presetThemesManifest,
      pluginThemeHref,
      pluginResourceEntries,
    };
  }

  renderCustomScript(customScript: string | null): JSX.Element {
    if (customScript == null || customScript.length === 0) {
      return <></>;
    }
    return <script id="customScript" dangerouslySetInnerHTML={{ __html: customScript }} />;
  }

  renderCustomCss(customCss: string | null): JSX.Element {
    if (customCss == null || customCss.length === 0) {
      return <></>;
    }
    return <style dangerouslySetInnerHTML={{ __html: customCss }} />;
  }

  renderCustomNoscript(customNoscript: string | null): JSX.Element {
    if (customNoscript == null || customNoscript.length === 0) {
      return <></>;
    }
    return <noscript dangerouslySetInnerHTML={{ __html: customNoscript }} />;
  }

  override render(): JSX.Element {
    const {
      customCss, customScript, customNoscript,
      theme, presetThemesManifest, pluginThemeHref, pluginResourceEntries,
    } = this.props;

    return (
      <Html>
        <Head>
          {this.renderCustomScript(customScript)}
          <link rel='preload' href="/static/fonts/PressStart2P-latin.woff2" as="font" type="font/woff2" />
          <link rel='preload' href="/static/fonts/PressStart2P-latin-ext.woff2" as="font" type="font/woff2" />
          <link rel='preload' href="/static/fonts/Lato-Regular-latin.woff2" as="font" type="font/woff2" />
          <link rel='preload' href="/static/fonts/Lato-Regular-latin-ext.woff2" as="font" type="font/woff2" />
          <link rel='preload' href="/static/fonts/Lato-Bold-latin.woff2" as="font" type="font/woff2" />
          <link rel='preload' href="/static/fonts/Lato-Bold-latin-ext.woff2" as="font" type="font/woff2" />
          <HeadersForThemes theme={theme}
            presetThemesManifest={presetThemesManifest} pluginThemeHref={pluginThemeHref} />
          <HeadersForGrowiPlugin pluginResourceEntries={pluginResourceEntries} />
          {this.renderCustomCss(customCss)}
        </Head>
        <body>
          {this.renderCustomNoscript(customNoscript)}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }

}

export default GrowiDocument;
