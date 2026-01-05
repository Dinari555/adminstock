import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';

// Store refresh tokens (in production, use Redis)
const refreshTokens = new Set();

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    refreshTokens.add(refreshToken);

    // Log login action
    await AuditLog.create({
      action: 'LOGIN',
      entity: 'Auth',
      userId: user._id,
      details: { email: user.email },
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokens.has(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateToken(decoded.userId);

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      refreshTokens.delete(req.body.refreshToken);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expiré',
      });
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    // Log logout action
    if (req.user) {
      await AuditLog.create({
        action: 'LOGOUT',
        entity: 'Auth',
        userId: req.user._id,
        ipAddress: req.ip || req.connection.remoteAddress,
      });
    }

    res.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    next(error);
  }
};


