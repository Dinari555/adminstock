import User from '../models/User.model.js';

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    let query = role ? { role } : {};

    // If user is employee, they can only see admin and themselves
    if (req.user.role === 'employee') {
      query = {
        $or: [{ role: 'admin' }, { _id: req.user._id }],
      };
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    // Only admin can create users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seul l\'administrateur peut créer des utilisateurs.',
      });
    }

    const { nom, prenom, email, password, role } = req.body;

    const user = new User({
      nom,
      prenom,
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      role: role || 'employee',
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // Only admin can update other users (users can update themselves potentially, but requirement says only Ihsen modifies)
    // Assuming strict admin-only modification for now based on "ladmin ihsen ferchichi que modifier"
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seul l\'administrateur peut modifier des utilisateurs.',
      });
    }

    const { nom, prenom, email, password, role } = req.body;
    const updateData = {};

    if (nom) updateData.nom = nom;
    if (prenom) updateData.prenom = prenom;
    if (email) updateData.email = email;
    if (password) updateData.passwordHash = password;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seul l\'administrateur peut supprimer des utilisateurs.',
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};


