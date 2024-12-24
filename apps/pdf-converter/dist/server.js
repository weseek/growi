import { __decorate, __metadata } from "tslib";
import { PlatformApplication } from '@tsed/common';
import { Configuration, Inject } from '@tsed/di';
import express from 'express';
import '@tsed/swagger';
import '@tsed/terminus';
import * as Controllers from './controllers/index.js';
import '@tsed/platform-express';
const PORT = Number(process.env.PORT || 3010);
let Server = class Server {
    app;
};
__decorate([
    Inject(),
    __metadata("design:type", PlatformApplication)
], Server.prototype, "app", void 0);
Server = __decorate([
    Configuration({
        port: PORT,
        acceptMimes: ['application/json'],
        mount: {
            '/': [...Object.values(Controllers)],
        },
        middlewares: [
            'json-parser',
            express.json({ limit: '50mb' }),
            express.urlencoded({ extended: true, limit: '50mb' }),
        ],
        swagger: [
            {
                path: '/v3/docs',
                specVersion: '3.0.1',
            },
        ],
        terminus: {
            signals: ['SIGINT', 'SIGTERM'],
        },
    })
], Server);
export default Server;
//# sourceMappingURL=server.js.map