import { $log } from '@tsed/common';
import { PlatformExpress } from '@tsed/platform-express';

import helpers from '^/../../src/lib/util/helpers';

import { Server } from './Server';

async function bootstrap() {
  try {
    $log.debug('Start server...');
    const platform = await PlatformExpress.bootstrap(Server);

    await platform.listen();
    $log.debug('Server initialized');

    if (helpers.hasProcessFlag('ci')) {
      $log.info('"--ci" flag is detected. Exit process.');
      process.exit();
    }
  }
  catch (er) {
    $log.error(er);
  }
}

bootstrap();
