"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errHandler = void 0;
const errHandler = (err, req, res, next) => {
    const stateCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    res.status(stateCode).json({ status: false, message });
};
exports.errHandler = errHandler;
//# sourceMappingURL=errorHandler.js.map