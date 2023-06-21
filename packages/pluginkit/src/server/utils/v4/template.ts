import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { GrowiPluginType } from '../../../consts';
import type { GrowiPluginValidationData, GrowiTemplatePluginValidationData } from '../../../model';
import { GrowiPluginValidationError } from '../../../model';

import { importPackageJson, validatePackageJson } from './package-json';


const statAsync = promisify(fs.stat);


/**
 * An utility for template plugin which wrap 'validatePackageJson' of './package-json.ts' module
 * @param projectDirRoot
 */
export const validateTemplatePluginPackageJson = async(projectDirRoot: string): Promise<GrowiTemplatePluginValidationData> => {
  const data = await validatePackageJson(projectDirRoot, GrowiPluginType.TEMPLATE);

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

export type TemplateStatus = {
  id: string,
  locale: string,
  isValid: boolean,
  invalidReason?: string,
}

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

export const scanTemplateStatus = async(projectDirRoot: string, templateId: string, data: GrowiTemplatePluginValidationData): Promise<TemplateStatus[]> => {
  const status: TemplateStatus[] = [];

  const tplRootDirPath = path.resolve(projectDirRoot, 'dist', templateId);

  for await (const locale of data.supportingLocales) {
    const tplDir = path.resolve(tplRootDirPath, locale);

    try {
      const {
        isTemplateExists, isMetaDataFileExists, meta,
      } = await getStats(tplDir);

      if (!isTemplateExists) throw new Error("'template.md does not exist.");
      if (!isMetaDataFileExists) throw new Error("'meta.md does not exist.");
      if (meta?.title == null) throw new Error("'meta.md does not contain the title.");

      status.push({ id: templateId, locale, isValid: true });
    }
    catch (err) {
      status.push({
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

export const scanAllTemplateStatus = async(projectDirRoot: string): Promise<TemplateStatus[]> => {
  const data = await validateTemplatePluginPackageJson(projectDirRoot);

  const status: TemplateStatus[] = [];

  const distDirPath = path.resolve(projectDirRoot, 'dist');
  const distDirFiles = fs.readdirSync(distDirPath);

  for await (const templateId of distDirFiles) {
    status.push(...await scanTemplateStatus(projectDirRoot, templateId, data));
  }

  return status;
};
