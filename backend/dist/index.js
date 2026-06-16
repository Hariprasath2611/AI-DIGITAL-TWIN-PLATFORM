"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
// Configurations
dotenv_1.default.config();
const db_1 = require("./config/db");
const routes_1 = __importDefault(require("./routes"));
const notificationSocket_1 = require("./sockets/notificationSocket");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // in production, restrict to your client domain
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});
const PORT = process.env.PORT || 5000;
// Security and utility middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // allow loading scripts/styles from CDN in dev
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Apply rate limiting to all requests
app.use('/api/', rateLimiter_1.apiLimiter);
// Mount main API routes
app.use('/api', routes_1.default);
// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Realtime Sockets Initializer
(0, notificationSocket_1.initNotificationSocket)(io);
// Global Error Handler Middleware
app.use(errorHandler_1.errorHandler);
// Connect to Database and start server
const startServer = async () => {
    await (0, db_1.connectDB)();
    server.listen(PORT, () => {
        console.log(`[Server] AI Digital Twin server running on port ${PORT}`);
    });
};
startServer().catch(err => {
    console.error('[Server] Critical start failure:', err);
});
