import path from 'node:path';

import { scanAllTemplateStatus, validateTemplatePluginPackageJson, validateTemplatePlugin } from '@growi/pluginkit/dist/v4/server';


const projectDirRoot = path.resolve(__dirname, '../');


it('Validation for package.json should be passed', () => {

  // when
  const caller = () => validateTemplatePluginPackageJson(projectDirRoot);

  // then
  expect(caller).not.toThrow();
});

it('Validation for package.json should be return data', () => {

  // when
  const data = validateTemplatePluginPackageJson(projectDirRoot);

  // then
  expect(data).not.toBeNull();
});

it('Scanning the templates ends up with no errors', async() => {
  // when
  const results = await scanAllTemplateStatus(projectDirRoot);

  // then
  expect(results).not.toBeNull();
});

it('Scanning the templates ends up with no errors with opts.data', async() => {

  // setup
  const data = validateTemplatePluginPackageJson(projectDirRoot);

  // when
  const results = await scanAllTemplateStatus(projectDirRoot, { data });

  // then
  expect(results).not.toBeNull();
});

it('Validation templates returns true', () => {
  // when
  const result = validateTemplatePlugin(projectDirRoot);

  // then
  expect(result).toBeTruthy();
});
