export declare const changePassword: (email: string, oldPassword: string, newPassword: string) => Promise<{
    message: string;
}>;
export declare const forgetPassword: (email: string) => Promise<{
    message: string;
}>;
export declare const resetPassword: (token: string, password: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=password.service.d.ts.map