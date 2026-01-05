import Product from '../models/Product.model.js';
import StockOperation from '../models/StockOperation.model.js';
import AuditLog from '../models/AuditLog.model.js';

export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, lowStock } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
      ];
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantite', '$seuilMin'] };
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    // Get stock operations history
    const stockOperations = await StockOperation.find({ productId: product._id })
      .populate('userId', 'nom prenom')
      .sort({ date: -1 })
      .limit(10);

    // Get audit logs for other operations (updates, etc)
    const auditLogs = await AuditLog.find({
      $or: [
        { entity: 'Product', entityId: product._id },
        { 'details.productId': product._id.toString() }
      ]
    })
      .populate('userId', 'nom prenom')
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        operations: stockOperations,
        history: auditLogs
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { nom, reference, quantite, seuilMin } = req.body;

    // Validation: quantité doit être < seuil min
    if (quantite !== undefined && seuilMin !== undefined && quantite >= seuilMin) {
      return res.status(400).json({
        success: false,
        message: 'La quantité doit être strictement inférieure au seuil minimum.',
      });
    }

    // Check for duplicates
    const existingProduct = await Product.findOne({
      $or: [{ reference }, { nom: nom.toUpperCase() }]
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Un produit avec cette référence ou ce nom existe déjà.',
      });
    }

    // Enforce uppercase name
    req.body.nom = nom.toUpperCase();

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { quantite, seuilMin } = req.body;

    // Validation: quantité doit être < seuil min
    // Si les deux sont fournis dans la requête, vérifier
    if (quantite !== undefined && seuilMin !== undefined && quantite >= seuilMin) {
      return res.status(400).json({
        success: false,
        message: 'La quantité doit être strictement inférieure au seuil minimum.',
      });
    }

    // Récupérer le produit actuel pour vérifier si on modifie seulement l'un des deux
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    // Si on modifie seulement la quantité, vérifier avec le seuilMin actuel
    if (quantite !== undefined && seuilMin === undefined) {
      if (quantite >= currentProduct.seuilMin) {
        return res.status(400).json({
          success: false,
          message: 'La quantité doit être strictement inférieure au seuil minimum.',
        });
      }
    }

    // Si on modifie seulement le seuilMin, vérifier avec la quantité actuelle
    if (seuilMin !== undefined && quantite === undefined) {
      if (currentProduct.quantite >= seuilMin) {
        return res.status(400).json({
          success: false,
          message: 'La quantité doit être strictement inférieure au seuil minimum.',
        });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productToCheck = await Product.findById(req.params.id);

    if (!productToCheck) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    // Only allow deletion if status is finished or quantity is 0
    if (productToCheck.status !== 'finished' && productToCheck.quantite > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un produit en cours. Le stock doit être épuisé.',
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    res.json({
      success: true,
      message: 'Produit supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { type, quantite, note } = req.body;
    const { id } = req.params;

    if (!['IN', 'OUT'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Le type doit être 'IN' ou 'OUT'",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    // Update stock quantity
    if (type === 'IN') {
      product.quantite += quantite;
      // If adding stock, ensure status is active
      if (product.quantite > 0) {
        product.status = 'active';
      }
    } else {
      if (product.quantite < quantite) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuffisant',
        });
      }
      product.quantite -= quantite;

      // If stock becomes 0, set status to finished
      if (product.quantite === 0) {
        product.status = 'finished';
      }
    }

    await product.save();

    // Create stock operation record
    const operation = new StockOperation({
      productId: id,
      type,
      quantite,
      userId: req.user._id,
      note,
    });

    await operation.save();

    // Log audit
    await AuditLog.create({
      action: type === 'IN' ? 'STOCK_IN' : 'STOCK_OUT',
      entity: 'StockOperation',
      entityId: operation._id,
      userId: req.user._id,
      details: {
        productId: id,
        productName: product.nom,
        quantite,
        type,
      },
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.json({
      success: true,
      data: {
        product,
        operation,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStockAlerts = async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantite', '$seuilMin'] },
    }).sort({ quantite: 1 });

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
};


