import { Controller, PlatformRouter } from '@tsed/common';
import next from 'next';

@Controller('/')
export class NextCtrl {

  constructor(private router: PlatformRouter) {
    this.init();
  }

  async init(): Promise<void> {
    const dev = process.env.NODE_ENV !== 'production';
    const nextApp = next({ dev });

    await nextApp.prepare();

    const handle = nextApp.getRequestHandler();

    this.router.get('/*', (req, res) => {
      // req.crowi = this;
      return handle(req, res);
    });
  }

}
