import { Logger } from '@tsed/common';
import PdfConvertService from '../service/pdf-convert.js';
declare class TerminusCtrl {
    private readonly pdfConvertService;
    logger: Logger;
    constructor(pdfConvertService: PdfConvertService);
    $onSignal(): Promise<void>;
    $onShutdown(): void;
}
export default TerminusCtrl;
