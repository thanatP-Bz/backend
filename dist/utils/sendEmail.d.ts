interface EmailOption {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare const sendEmail: (options: EmailOption) => Promise<void>;
export {};
//# sourceMappingURL=sendEmail.d.ts.map