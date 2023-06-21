import path from 'node:path';

import { scanAllTemplateStatus, validateTemplatePluginPackageJson, validateTemplatePlugin } from '@growi/pluginkit/dist/server/utils/v4';


const projectDirRoot = path.resolve(__dirname, '../');


it('Validation for package.json should be passed', () => {

  // when
  const caller = () => validateTemplatePluginPackageJson(projectDirRoot);

  // then
  expect(caller).not.toThrow();
});

it('Scanning the templates ends up with no errors', async() => {

  // setup
  const data = await validateTemplatePluginPackageJson(projectDirRoot);

  // when
  const caller = () => scanAllTemplateStatus(projectDirRoot, data);

  // then
  expect(caller).not.toThrow();
});

it('Validation templates returns true', async() => {
  // when
  const result = await validateTemplatePlugin(projectDirRoot);

  // then
  expect(result).toBeTruthy();
});
