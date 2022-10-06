import React from 'react';

import fs from 'fs';
import path from 'path';

import Document, {
  DocumentContext, DocumentInitialProps,
  Html, Head, Main, NextScript,
} from 'next/document';

import { GrowiPlugin, GrowiPluginResourceType } from '~/interfaces/plugin';
import { resolveFromRoot } from '~/utils/project-dir-utils';


// FIXME: dummy data
// ------------------
const growiPluginsExample: GrowiPlugin[] = [
  {
    isEnabled: true,
    installedPath: 'weseek/growi-plugin-jstest',
    origin: {
      url: 'https://github.com/weseek/growi-plugin-jstest',
    },
    meta: {
      name: 'weseek/growi-plugin-jstest',
      types: [GrowiPluginResourceType.Script],
    },
  },
];
// ------------------


type GrowiPluginManifestEntries = [growiPlugin: GrowiPlugin, manifest: any][];

interface GrowiDocumentProps {
  pluginManifestEntries: GrowiPluginManifestEntries;
}
declare type GrowiDocumentInitialProps = DocumentInitialProps & GrowiDocumentProps;

async function retrievePluginManifests(growiPlugins: GrowiPlugin[]): Promise<GrowiPluginManifestEntries> {
  const entries: GrowiPluginManifestEntries = [];

  growiPlugins.forEach(async(growiPlugin) => {
    const manifestPath = resolveFromRoot(path.join('tmp/plugins', growiPlugin.installedPath, 'dist/manifest.json'));
    const customManifestStr: string = await fs.readFileSync(manifestPath, 'utf-8');
    entries.push([growiPlugin, JSON.parse(customManifestStr)]);
  });

  return entries;
}

class GrowiDocument extends Document<GrowiDocumentProps> {

  static override async getInitialProps(ctx: DocumentContext): Promise<GrowiDocumentInitialProps> {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx);

    // TODO: load GrowiPlugin documents from DB
    // const pluginManifestEntries: GrowiPluginManifestEntries = await retrievePluginManifests(growiPluginsExample);
    const pluginManifestEntries: GrowiPluginManifestEntries = await retrievePluginManifests([]);

    return { ...initialProps, pluginManifestEntries };
  }

  override render(): JSX.Element {

    const { pluginManifestEntries } = this.props;

    return (
      <Html>
        <Head>
          {/*
          {renderScriptTagsByGroup('basis')}
          {renderStyleTagsByGroup('basis')}
          */}
          { pluginManifestEntries.map(([growiPlugin, manifest]) => (
            growiPlugin.meta.types.includes(GrowiPluginResourceType.Script) && (
              <>
                <link rel="stylesheet" key={`link_${growiPlugin.installedPath}`}
                  href={`/plugins/${growiPlugin.installedPath}/dist/${manifest['client-entry.tsx'].css}`} />
                {/* eslint-disable-next-line @next/next/no-sync-scripts */ }
                <script type="module" key={`script_${growiPlugin.installedPath}`}
                  src={`/plugins/${growiPlugin.installedPath}/dist/${manifest['client-entry.tsx'].file}`} />
              </>
            )
          )) }
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
