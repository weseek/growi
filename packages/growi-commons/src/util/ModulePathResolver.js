import * as path from 'path';

/**
 * Resolve path tools
 */
export class ModulePathResolver {

  relativeFromRoot(modulePath) {
    const appRoot = path.dirname(require.main.filename)
    return path.relative(appRoot, modulePath)
  }

}
