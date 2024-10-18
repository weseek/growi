declare const client: {
    pdf: {
        "sync-job": import("hono/client").ClientRequest<{
            $post: {
                input: {
                    json: {
                        status: "HTML_EXPORT_IN_PROGRESS" | "HTML_EXPORT_DONE" | "FAILED";
                        jobId: string;
                        expirationDate: string;
                    };
                };
                output: {
                    status: import("./service/pdf-convert").JobStatus;
                };
                outputFormat: "json";
                status: import("hono/utils/http-status").StatusCode;
            };
        }>;
    };
};
export type Client = typeof client;
export declare const pdfConverterHc: (baseUrl: string, options?: import("hono").ClientRequestOptions | undefined) => Client;
export {};
