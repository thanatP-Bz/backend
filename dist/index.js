"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connectDB_1 = __importDefault(require("./config/connectDB"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const oauthRoutes_1 = __importDefault(require("./routes/oauthRoutes"));
const _2FARoutes_1 = __importDefault(require("./routes/2FARoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("../src/config/passport"));
const app = (0, express_1.default)();
//middleware
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "SESSION_SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅ Updated for production
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // ✅ Updated
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}));
app.use(express_1.default.json());
//add passport initialization
app.use(passport_1.default.initialize());
// ✅ Updated CORS for production
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
//router
app.use("/api/auth", authRoutes_1.default);
app.use("/api/task", taskRoutes_1.default);
app.use("/api/2fa", _2FARoutes_1.default);
app.use("/api/auth", oauthRoutes_1.default);
//errorHandler
app.use(errorHandler_1.errHandler);
app.get("/", (req, res) => {
    res.send("hello world");
});
const PORT = process.env.PORT || 4004;
const MONGO_URI = process.env.MONGO_URI;
const serverStart = async () => {
    await (0, connectDB_1.default)(MONGO_URI);
    app.listen(PORT, () => {
        console.log(`Listening to port ${PORT}`); // ✅ Fixed typo
    });
    console.log(process.env.PORT);
};
serverStart();
//# sourceMappingURL=index.js.map