import Client from '../models/Client.model.js';
import Invoice from '../models/Invoice.model.js';

export const getClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const clients = await Client.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Client.countDocuments(query);

    res.json({
      success: true,
      data: {
        clients,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé',
      });
    }

    // Get client invoices
    const invoices = await Invoice.find({ clientId: client._id })
      .sort({ date: -1 })
      .populate('createdBy', 'nom prenom email');

    res.json({
      success: true,
      data: {
        ...client.toObject(),
        invoices,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req, res, next) => {
  try {
    const { contact } = req.body;
    const existingClient = await Client.findOne({ contact });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Un client avec ce contact existe déjà.',
      });
    }

    const client = new Client(req.body);
    await client.save();

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { credit, ...otherUpdates } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé',
      });
    }

    // Handle credit update and history
    if (credit !== undefined && credit !== client.credit) {
      const diff = credit - client.credit;
      client.credit = credit;
      client.history.push({
        amount: Math.abs(diff),
        type: diff < 0 ? 'payment' : 'credit_update',
        note: req.body.note || 'Mise à jour du crédit',
        userId: req.user._id,
      });
    }

    // Apply other updates
    Object.assign(client, otherUpdates);

    await client.save();
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const clientToCheck = await Client.findById(req.params.id);

    if (!clientToCheck) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé',
      });
    }

    if (clientToCheck.credit > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un client avec un crédit restant.',
      });
    }

    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé',
      });
    }

    res.json({
      success: true,
      message: 'Client supprimé avec succès',
    });
  } catch (error) {
  }
}; 

