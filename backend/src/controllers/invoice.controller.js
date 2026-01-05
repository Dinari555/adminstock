import Invoice from '../models/Invoice.model.js';
import Product from '../models/Product.model.js';
import Client from '../models/Client.model.js';
import StockOperation from '../models/StockOperation.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { generateInvoicePDF } from '../services/pdf.service.js';

export const getInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, statut, clientId, search } = req.query;
    const query = {};

    if (statut) query.statut = statut;
    if (clientId) query.clientId = clientId;

    let invoices = await Invoice.find(query)
      .populate('clientId', 'nom prenom email')
      .populate('createdBy', 'nom prenom')
      .sort({ date: -1 });

    // Recherche textuelle sur le client ou le numéro de facture
    if (search) {
      const searchLower = search.toLowerCase();
      invoices = invoices.filter((invoice) => {
        const clientName = `${invoice.clientId?.nom || ''} ${invoice.clientId?.prenom || ''}`.toLowerCase();
        const clientEmail = (invoice.clientId?.email || '').toLowerCase();
        const invoiceNumber = invoice._id.toString().toLowerCase();
        return (
          clientName.includes(searchLower) ||
          clientEmail.includes(searchLower) ||
          invoiceNumber.includes(searchLower)
        );
      });
    }

    const total = invoices.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    invoices = invoices.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        invoices,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId')
      .populate('createdBy', 'nom prenom email')
      .populate('items.productId', 'nom reference prix');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée',
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const { clientId, items } = req.body;

    // Validate client
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé',
      });
    }

    // Calculate totals and validate products
    let total = 0;
    const invoiceItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produit avec ID ${item.productId} non trouvé`,
        });
      }

      if (product.quantite < item.qte) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour ${product.nom}. Stock disponible: ${product.quantite}`,
        });
      }

      const itemTotal = item.qte * product.prix;
      total += itemTotal;

      invoiceItems.push({
        productId: item.productId,
        qte: item.qte,
        prixUnitaire: product.prix,
        total: itemTotal,
      });
    }

    // Create invoice
    const invoice = new Invoice({
      clientId,
      items: invoiceItems,
      total,
      createdBy: req.user._id,
      statut: 'en_attente',
    });

    await invoice.save();

    // Update stock (reduce quantities)
    for (const item of invoiceItems) {
      const product = await Product.findById(item.productId);
      product.quantite -= item.qte;
      await product.save();

      // Create stock operation
      await StockOperation.create({
        productId: item.productId,
        type: 'OUT',
        quantite: item.qte,
        userId: req.user._id,
        note: `Facture ${invoice._id}`,
      });
    }

    // Log audit
    await AuditLog.create({
      action: 'INVOICE_CREATE',
      entity: 'Invoice',
      entityId: invoice._id,
      userId: req.user._id,
      details: {
        clientId,
        total,
        itemsCount: items.length,
      },
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('clientId')
      .populate('createdBy', 'nom prenom');

    res.status(201).json({
      success: true,
      data: populatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (req, res, next) => {
  try {
    const { statut } = req.body;

    if (statut && !['payé', 'en_attente', 'en_retard'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide',
      });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true, runValidators: true }
    )
      .populate('clientId')
      .populate('createdBy', 'nom prenom');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée',
      });
    }

    // Log audit
    await AuditLog.create({
      action: 'INVOICE_UPDATE',
      entity: 'Invoice',
      entityId: invoice._id,
      userId: req.user._id,
      details: { statut },
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée',
      });
    }

    // Restore stock
    for (const item of invoice.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantite += item.qte;
        await product.save();
      }
    }

    await Invoice.findByIdAndDelete(req.params.id);

    // Log audit
    await AuditLog.create({
      action: 'INVOICE_DELETE',
      entity: 'Invoice',
      entityId: invoice._id,
      userId: req.user._id,
      details: { total: invoice.total },
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.json({
      success: true,
      message: 'Facture supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};

export const generatePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId')
      .populate('items.productId', 'nom reference');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée',
      });
    }

    const products = invoice.items.map((item) => item.productId);

    const pdfResult = await generateInvoicePDF(
      invoice,
      invoice.clientId,
      products
    );

    // Update invoice with PDF URL
    invoice.archivedPdfUrl = pdfResult.url;
    await invoice.save();

    res.download(pdfResult.filePath, pdfResult.fileName, (err) => {
      if (err) {
        console.error('PDF download error:', err);
      }
    });
  } catch (error) {
    next(error);
  }
};


