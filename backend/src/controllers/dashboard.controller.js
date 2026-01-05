import Invoice from '../models/Invoice.model.js';
import Product from '../models/Product.model.js';
import Client from '../models/Client.model.js';
import mongoose from 'mongoose';

export const getSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Sales today
    const salesToday = await Invoice.aggregate([
      {
        $match: {
          date: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
    ]);

    // Sales this month
    const salesMonth = await Invoice.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
    ]);

    // Stock value
    const stockValue = await Product.aggregate([
      {
        $project: {
          value: { $multiply: ['$quantite', '$prix'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' },
        },
      },
    ]);

    // Low stock products count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$quantite', '$seuilMin'] },
    });

    // Total clients
    const totalClients = await Client.countDocuments();

    // Top products (by quantity sold)
    const topProducts = await Invoice.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.qte' },
          totalRevenue: { $sum: '$items.total' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productName: '$product.nom',
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        salesToday: {
          count: salesToday[0]?.count || 0,
          total: salesToday[0]?.total || 0,
        },
        salesMonth: {
          count: salesMonth[0]?.count || 0,
          total: salesMonth[0]?.total || 0,
        },
        stockValue: stockValue[0]?.total || 0,
        lowStockCount,
        totalClients,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesByPeriod = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const matchStage = {};

    if (from || to) {
      matchStage.date = {};
      if (from) {
        matchStage.date.$gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        matchStage.date.$lte = toDate;
      }
    }

    const sales = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    res.json({
      success: true,
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};


