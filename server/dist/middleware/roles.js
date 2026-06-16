"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = exports.requireRecruiter = exports.requireAdmin = exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized: Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)(['admin']);
exports.requireRecruiter = (0, exports.requireRole)(['recruiter', 'admin']);
exports.requireUser = (0, exports.requireRole)(['user', 'admin']);
