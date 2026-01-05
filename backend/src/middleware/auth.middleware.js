import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant. Authentification requise.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré.',
      });
    }
    next(error);
  }
};

export const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.',
      });
    }

    next();
  };
};

export const auditAction = async (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    // Log audit for critical actions
    if (req.user && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
      const actionMap = {
        POST: 'CREATE',
        PUT: 'UPDATE',
        DELETE: 'DELETE',
      };

      // Determine entity based on baseUrl (ex: /api/v1/users -> 'User')
      const basePath = req.baseUrl || '';
      const segments = basePath.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1] || 'unknown';

      let entity;
      switch (lastSegment) {
        case 'users':
          entity = 'User';
          break;
        case 'clients':
          entity = 'Client';
          break;
        case 'products':
          entity = 'Product';
          break;
        case 'invoices':
          entity = 'Invoice';
          break;
        case 'stock':
        case 'stock-operations':
          entity = 'StockOperation';
          break;
        case 'auth':
          entity = 'Auth';
          break;
        default:
          entity = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).toLowerCase();
      }

      // Get entityId: from params for PUT/DELETE, from response data for POST
      let entityId = req.params.id || null;
      if (req.method === 'POST' && data && data.data) {
        // Try to get ID from response data
        entityId = data.data._id || data.data.id || null;
      }

      AuditLog.create({
        action: actionMap[req.method] || 'UNKNOWN',
        entity,
        entityId: entityId,
        userId: req.user._id,
        details: {
          method: req.method,
          path: req.path,
          body: req.method === 'POST' || req.method === 'PUT' ? req.body : null,
        },
        ipAddress: req.ip || req.connection.remoteAddress,
      }).catch((err) => {
        console.error('Audit log error:', err);
      });
    }

    return originalJson.call(this, data);
  };

  next();
};


