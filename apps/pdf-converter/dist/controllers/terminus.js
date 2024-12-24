import { __decorate, __metadata } from "tslib";
import { Logger } from '@tsed/common';
import { Inject, Injectable } from '@tsed/di';
import PdfConvertService from '../service/pdf-convert.js';
let TerminusCtrl = class TerminusCtrl {
    pdfConvertService;
    logger;
    constructor(pdfConvertService) {
        this.pdfConvertService = pdfConvertService;
    }
    async $onSignal() {
        this.logger.info('Server is starting cleanup');
        await this.pdfConvertService.closePuppeteerCluster();
    }
    $onShutdown() {
        this.logger.info('Cleanup finished, server is shutting down');
    }
};
__decorate([
    Inject(),
    __metadata("design:type", Logger)
], TerminusCtrl.prototype, "logger", void 0);
TerminusCtrl = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PdfConvertService])
], TerminusCtrl);
export default TerminusCtrl;
//# sourceMappingURL=terminus.js.map