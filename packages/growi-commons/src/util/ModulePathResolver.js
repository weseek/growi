import * as path from 'path';
import * as appRoot from 'app-root-path';

/**
 * Resolve path tools
 */
export class ModulePathResolver {

  relativeFromRoot(modulePath) {
    return path.relative(appRoot.path, modulePath)
  }

}
