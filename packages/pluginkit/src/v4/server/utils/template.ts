import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { GrowiPluginType } from '@growi/core/dist/consts';

import type { GrowiPluginValidationData, GrowiTemplatePluginValidationData } from '~/model';
import { GrowiPluginValidationError } from '~/model';

import { isTemplateStatusValid, type TemplateStatus, type TemplateSummary } from '../../interfaces';

import { validatePackageJson } from './package-json';


const statAsync = promisify(fs.stat);


/**
 * An utility for template plugin which wrap 'validatePackageJson' of './package-json.ts' module
 * @param projectDirRoot
 */
export const validateTemplatePluginPackageJson = (projectDirRoot: string): GrowiTemplatePluginValidationData => {
  const data = validatePackageJson(projectDirRoot, GrowiPluginType.Template);

  const { growiPlugin } = data;

  // check supporting locales
  const supportingLocales: string[] | undefined = growiPlugin.locales;
  if (supportingLocales == null || supportingLocales.length === 0) {
    throw new GrowiPluginValidationError<GrowiPluginValidationData & { supportingLocales?: string[] }>(
      "Template plugin must have 'supportingLocales' and that must have one or more locales",
      {
        ...data,
        supportingLocales,
      },
    );
  }

  return {
    ...data,
    supportingLocales,
  };
};


type TemplateDirStatus = {
  isTemplateExists: boolean,
  meta?: { [key: string]: string },
}

async function getStats(tplDir: string): Promise<TemplateDirStatus> {
  const markdownPath = path.resolve(tplDir, 'template.md');
  const statForMarkdown = await statAsync(markdownPath);
  const isTemplateExists = statForMarkdown.isFile();

  const metaDataPath = path.resolve(tplDir, 'meta.json');
  const statForMetaDataFile = await statAsync(metaDataPath);
  const isMetaDataFileExists = statForMetaDataFile.isFile();

  const result: TemplateDirStatus = {
    isTemplateExists,
    meta: isMetaDataFileExists ? await import(metaDataPath) : undefined,
  };

  return result;
}


export const scanTemplateStatus = async(
    projectDirRoot: string,
    templateId: string,
    data: GrowiTemplatePluginValidationData,
    opts?: {
      pluginId?: string,
    },
): Promise<TemplateStatus[]> => {
  const status: TemplateStatus[] = [];

  const tplRootDirPath = path.resolve(projectDirRoot, 'dist', templateId);

  let isDefaultPushed = false;
  for await (const locale of data.supportingLocales) {
    const tplDir = path.resolve(tplRootDirPath, locale);

    try {
      const stats = await getStats(tplDir);
      const {
        isTemplateExists, meta,
      } = stats;

      if (!isTemplateExists) throw new Error("'template.md does not exist.");
      if (meta == null) throw new Error("'meta.md does not exist.");
      if (meta?.title == null) throw new Error("'meta.md does not contain the title.");

      const isDefault = !isDefaultPushed;
      status.push({
        pluginId: opts?.pluginId,
        id: templateId,
        locale,
        isValid: true,
        isDefault,
        title: meta.title,
        desc: meta.desc,
      });
      isDefaultPushed = true;
    }
    catch (err) {
      status.push({
        pluginId: opts?.pluginId,
        id: templateId,
        locale,
        isValid: false,
        invalidReason: err.message,
      });
    }
  }

  // eslint-disable-next-line no-console
  console.debug({ status });

  return status;
};

export const scanAllTemplateStatus = async(
    projectDirRoot: string,
    opts?: {
      data?: GrowiTemplatePluginValidationData,
      pluginId?: string,
      returnsInvalidTemplates?: boolean,
    },
): Promise<TemplateSummary[]> => {

  const data = opts?.data ?? validateTemplatePluginPackageJson(projectDirRoot);

  const summaries: TemplateSummary[] = [];

  const distDirPath = path.resolve(projectDirRoot, 'dist');
  const distDirFiles = fs.readdirSync(distDirPath);

  for await (const templateId of distDirFiles) {
    const status = (await scanTemplateStatus(projectDirRoot, templateId, data, { pluginId: opts?.pluginId }))
      // omit invalid templates if `returnsInvalidTemplates` is true
      .filter(s => (opts?.returnsInvalidTemplates ? true : s.isValid));

    // determine default locale
    const defaultTemplateStatus = status.find(s => 'isDefault' in s && s.isDefault);

    if (defaultTemplateStatus == null || !isTemplateStatusValid(defaultTemplateStatus)) {
      continue;
    }

    summaries.push({
      // for the 'default' key
      default: defaultTemplateStatus,
      // for each locale keys
      ...Object.fromEntries(status.map(templateStatus => [templateStatus.locale, templateStatus])),
    });
  }

  return summaries;
};

export const validateTemplatePlugin = async(projectDirRoot: string): Promise<boolean> => {
  const data = validateTemplatePluginPackageJson(projectDirRoot);

  const results = await scanAllTemplateStatus(projectDirRoot, { data, returnsInvalidTemplates: true });

  if (Object.keys(results).length === 0) {
    throw new Error('This plugin does not have any templates');
  }

  // construct map
  // key: id
  // value: isValid properties
  const idValidMap: { [id: string]: boolean[] } = {};
  results.forEach((summary) => {
    idValidMap[summary.default.id] = Object.values(summary).map(s => s?.isValid ?? false);
  });

  for (const [id, validMap] of Object.entries(idValidMap)) {
    // warn
    if (!validMap.every(bool => bool)) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] Template '${id}' has some locales that status is invalid`);
    }

    // This means the template directory does not have any valid template
    if (!validMap.some(bool => bool)) {
      return false;
    }
  }

  return true;
};

export const getMarkdown = async(projectDirRoot: string, templateId: string, locale: string): Promise<string> => {
  const tplDir = path.resolve(projectDirRoot, 'dist', templateId, locale);

  const { isTemplateExists } = await getStats(tplDir);

  if (!isTemplateExists) throw new Error("'template.md does not exist.");

  const markdownPath = path.resolve(tplDir, 'template.md');
  return fs.readFileSync(markdownPath, { encoding: 'utf-8' });
};
