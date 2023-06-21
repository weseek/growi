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
    // when
    const results = await scanAllTemplateStatus(projectDirRoot);

    const idValidMap: { [id: string]: boolean[] } = {};
    results.forEach((status) => {
      const validMap = idValidMap[status.id] ?? [];
      validMap.push(status.isValid);
      idValidMap[status.id] = validMap;
    });

    // then
    expect(results.length).toBeGreaterThan(0);

    Object.entries(idValidMap).forEach(([, validMap]) => {
      expect(validMap.some(bool => bool === true)).toBeTruthy();
    });
  });

});
