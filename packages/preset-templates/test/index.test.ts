import path from 'node:path';

import { scanAllTemplateStatus, validateTemplatePluginPackageJson } from '@growi/pluginkit/dist/server/utils/v4';


const projectDirRoot = path.resolve(__dirname, '../');


it('Validation should be passed', () => {

  // when
  const caller = () => validateTemplatePluginPackageJson(projectDirRoot);

  // then
  expect(caller).not.toThrow();
});


describe('Scanning the template package', () => {

  it('ends up with no errors', () => {
    // when
    const caller = () => scanAllTemplateStatus(projectDirRoot);

    // then
    expect(caller).not.toThrow();
  });

  it('successfully returns results that each template has at least one valid template', async() => {
    // setup
    const data = await validateTemplatePluginPackageJson(projectDirRoot);

    // when 1
    const results = await scanAllTemplateStatus(projectDirRoot);

    // then 1
    expect(results.length).toBeGreaterThan(0);

    // when 2
    const idValidMap: { [id: string]: boolean[] } = {};
    results.forEach((status) => {
      const validMap = idValidMap[status.id] ?? [];
      validMap.push(status.isValid);
      idValidMap[status.id] = validMap;
    });

    // then 2
    Object.entries(idValidMap).forEach(([id, validMap]) => {
      assert(validMap.length === data.supportingLocales.length);

      if (!validMap.every(bool => bool)) {
        // eslint-disable-next-line no-console
        console.warn(`[WARN] Template '${id}' has invalid status`);
      }
      expect(validMap.some(bool => bool)).toBeTruthy();
    });
  });

});
