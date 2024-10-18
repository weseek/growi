import { Hono } from 'hono';
import { JobStatus } from '../service/pdf-convert';
declare const app: Hono<import("hono/types").BlankEnv, {
    "/sync-job": {
        $post: {
            input: {
                json: {
                    status: "HTML_EXPORT_IN_PROGRESS" | "HTML_EXPORT_DONE" | "FAILED";
                    jobId: string;
                    expirationDate: string;
                };
            };
            output: {
                status: JobStatus;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").StatusCode;
        };
    };
}, "/">;
export default app;
