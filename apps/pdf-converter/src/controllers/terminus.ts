import { Logger } from '@tsed/common';
import { Inject, Injectable } from '@tsed/di';

import PdfConvertService from '../service/pdf-convert';

@Injectable()
class TerminusCtrl {

  @Inject()
    logger: Logger;

  constructor(private readonly pdfConvertService: PdfConvertService) {}

  async $onSignal(): Promise<void> {
    this.logger.info('Server is starting cleanup');
    await this.pdfConvertService.closePuppeteerCluster();
  }

  $onShutdown(): void {
    this.logger.info('Cleanup finished, server is shutting down');
  }

}

export default TerminusCtrl;
