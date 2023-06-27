import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { GrowiPluginType } from '@growi/core/dist/consts';

import type { GrowiPluginValidationData, GrowiTemplatePluginValidationData } from '~/model';
import { GrowiPluginValidationError } from '~/model';

import { importPackageJson, validatePackageJson } from './package-json';


const statAsync = promisify(fs.stat);


/**
 * An utility for template plugin which wrap 'validatePackageJson' of './package-json.ts' module
 * @param projectDirRoot
 */
export const validateTemplatePluginPackageJson = async(projectDirRoot: string): Promise<GrowiTemplatePluginValidationData> => {
  const data = await validatePackageJson(projectDirRoot, GrowiPluginType.Template);

  const pkg = await importPackageJson(projectDirRoot);

  // check supporting locales
  const supportingLocales: string[] | undefined = pkg.growiPlugin.locales;
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
  isMetaDataFileExists: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: any,
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
    isMetaDataFileExists,
  };

  if (isMetaDataFileExists) {
    result.meta = await import(metaDataPath);
  }

  return result;
}


export type TemplateStatus = {
  id: string,
  locale: string,
  isValid: boolean,
  isDefault: boolean,
  invalidReason?: string,
}

export const scanTemplateStatus = async(projectDirRoot: string, templateId: string, data: GrowiTemplatePluginValidationData): Promise<TemplateStatus[]> => {
  const status: TemplateStatus[] = [];

  const tplRootDirPath = path.resolve(projectDirRoot, 'dist', templateId);

  let isDefaultPushed = false;
  for await (const locale of data.supportingLocales) {
    const tplDir = path.resolve(tplRootDirPath, locale);

    try {
      const {
        isTemplateExists, isMetaDataFileExists, meta,
      } = await getStats(tplDir);

      if (!isTemplateExists) throw new Error("'template.md does not exist.");
      if (!isMetaDataFileExists) throw new Error("'meta.md does not exist.");
      if (meta?.title == null) throw new Error("'meta.md does not contain the title.");

      const isDefault = !isDefaultPushed;
      status.push({
        id: templateId,
        locale,
        isValid: true,
        isDefault,
      });
      isDefaultPushed = true;
    }
    catch (err) {
      status.push({
        id: templateId,
        locale,
        isValid: false,
        isDefault: false,
        invalidReason: err.message,
      });
    }
  }

  // eslint-disable-next-line no-console
  console.debug({ status });

  return status;
};

export type TemplateSummary = {
  default: TemplateStatus | null,
  [locale: string]: TemplateStatus | null,
}

export const scanAllTemplateStatus = async(
    projectDirRoot: string,
    opts?: {
      data?: GrowiTemplatePluginValidationData,
      returnsInvalidTemplates?: boolean,
    },
): Promise<{ [templateId: string]: TemplateSummary }> => {

  const data = opts?.data ?? await validateTemplatePluginPackageJson(projectDirRoot);

  const summaries = {};

  const distDirPath = path.resolve(projectDirRoot, 'dist');
  const distDirFiles = fs.readdirSync(distDirPath);

  for await (const templateId of distDirFiles) {
    const status = (await scanTemplateStatus(projectDirRoot, templateId, data))
      // omit invalid templates if `returnsInvalidTemplates` is true
      .filter(s => (opts?.returnsInvalidTemplates ? true : s.isValid));

    // determine default locale
    const defaultTemplateStatus = status.find(s => s.isDefault);

    summaries[templateId] = Object.assign(
      // for the 'default' key
      { default: defaultTemplateStatus ?? null },
      // for each locale keys
      Object.fromEntries(status.map(templateStatus => [templateStatus.locale, templateStatus])),
    );
  }

  return summaries;
};

export const validateTemplatePlugin = async(projectDirRoot: string): Promise<boolean> => {
  const data = await validateTemplatePluginPackageJson(projectDirRoot);

  const results = await scanAllTemplateStatus(projectDirRoot, { data, returnsInvalidTemplates: true });

  if (Object.keys(results).length === 0) {
    throw new Error('This plugin does not have any templates');
  }

  // construct map
  // key: id
  // value: isValid properties
  const idValidMap: { [id: string]: boolean[] } = {};
  Object.entries(results).forEach(([templateId, status]) => {
    idValidMap[templateId] = Object.values(status).map(s => s?.isValid ?? false);
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
