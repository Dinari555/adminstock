import AuditLog from '../models/AuditLog.model.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, entity, entityId, userId, from, to } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (entityId) query.entityId = entityId;
    if (userId) query.userId = userId;

    if (from || to) {
      query.date = {};
      if (from) {
        query.date.$gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'nom prenom email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};


