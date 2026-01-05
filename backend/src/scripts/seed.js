import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Client from '../models/Client.model.js';
import Product from '../models/Product.model.js';
import Invoice from '../models/Invoice.model.js';
import StockOperation from '../models/StockOperation.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/depot_dashboard';

export const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Client.deleteMany({});
    await Product.deleteMany({});
    await Invoice.deleteMany({});
    await StockOperation.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = new User({
      nom: 'Admin',
      prenom: 'System',
      email: 'admin@admin.com',
      passwordHash: 'admin1', // Will be hashed by pre-save hook
      role: 'admin',
    });
    await admin.save();
    console.log('✅ Created admin user');

    // Create employee user
    const employee = new User({
      nom: 'Doe',
      prenom: 'John',
      email: 'employee@employee.com',
      passwordHash: 'employee',
      role: 'employee',
    });
    await employee.save();
    console.log('✅ Created employee user');

    // Create clients
    const clients = [
      {
        nom: 'Kouassi',
        prenom: 'Jean',
        contact: '+225 07 12 34 56 78',
        email: 'jean.kouassi@example.com',
        adresse: 'Abidjan, Cocody',
      },
      {
        nom: 'Diallo',
        prenom: 'Aminata',
        contact: '+225 05 98 76 54 32',
        email: 'aminata.diallo@example.com',
        adresse: 'Abidjan, Yopougon',
      },
      {
        nom: 'Traoré',
        prenom: 'Mohamed',
        contact: '+225 01 23 45 67 89',
        email: 'mohamed.traore@example.com',
        adresse: 'Abidjan, Marcory',
      },
      {
        nom: 'Koffi',
        prenom: 'Marie',
        contact: '+225 09 87 65 43 21',
        email: 'marie.koffi@example.com',
        adresse: 'Abidjan, Deux-Plateaux',
      },
      {
        nom: 'Sangaré',
        prenom: 'Ibrahim',
        contact: '+225 06 54 32 10 98',
        email: 'ibrahim.sangare@example.com',
        adresse: 'Abidjan, Plateau',
      },
    ];

    const createdClients = await Client.insertMany(clients);
    console.log(`✅ Created ${createdClients.length} clients`);

    // Create products
    const products = [
      {
        reference: 'PROD-001',
        nom: 'Cahier 200 pages',
        description: 'Cahier à grands carreaux, 200 pages',
        prix: 2500,
        quantite: 150,
        seuilMin: 20,
      },
      {
        reference: 'PROD-002',
        nom: 'Stylo Bic bleu',
        description: 'Stylo à bille bleu, pointe moyenne',
        prix: 500,
        quantite: 300,
        seuilMin: 50,
      },
      {
        reference: 'PROD-003',
        nom: 'Gomme',
        description: 'Gomme blanche standard',
        prix: 200,
        quantite: 200,
        seuilMin: 30,
      },
      {
        reference: 'PROD-004',
        nom: 'Règle 30cm',
        description: 'Règle en plastique, 30 centimètres',
        prix: 800,
        quantite: 80,
        seuilMin: 15,
      },
      {
        reference: 'PROD-005',
        nom: 'Compas',
        description: 'Compas en métal',
        prix: 3500,
        quantite: 25,
        seuilMin: 10,
      },
      {
        reference: 'PROD-006',
        nom: 'Cartable',
        description: 'Cartable scolaire, rouge',
        prix: 15000,
        quantite: 12,
        seuilMin: 5,
      },
      {
        reference: 'PROD-007',
        nom: 'Trousse',
        description: 'Trousse à crayons, bleue',
        prix: 5000,
        quantite: 8,
        seuilMin: 5,
      },
      {
        reference: 'PROD-008',
        nom: 'Crayon HB',
        description: 'Crayon à papier, pointe HB',
        prix: 300,
        quantite: 400,
        seuilMin: 50,
      },
      {
        reference: 'PROD-009',
        nom: 'Marqueur',
        description: 'Marqueur fluorescent, jaune',
        prix: 1000,
        quantite: 60,
        seuilMin: 15,
      },
      {
        reference: 'PROD-010',
        nom: 'Taille-crayon',
        description: 'Taille-crayon avec réservoir',
        prix: 1500,
        quantite: 45,
        seuilMin: 10,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create some invoices
    const invoices = [
      {
        clientId: createdClients[0]._id,
        items: [
          {
            productId: createdProducts[0]._id,
            qte: 5,
            prixUnitaire: createdProducts[0].prix,
            total: 5 * createdProducts[0].prix,
          },
          {
            productId: createdProducts[1]._id,
            qte: 10,
            prixUnitaire: createdProducts[1].prix,
            total: 10 * createdProducts[1].prix,
          },
        ],
        total: 5 * createdProducts[0].prix + 10 * createdProducts[1].prix,
        statut: 'payé',
        createdBy: admin._id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        clientId: createdClients[1]._id,
        items: [
          {
            productId: createdProducts[2]._id,
            qte: 3,
            prixUnitaire: createdProducts[2].prix,
            total: 3 * createdProducts[2].prix,
          },
          {
            productId: createdProducts[3]._id,
            qte: 2,
            prixUnitaire: createdProducts[3].prix,
            total: 2 * createdProducts[3].prix,
          },
        ],
        total: 3 * createdProducts[2].prix + 2 * createdProducts[3].prix,
        statut: 'en_attente',
        createdBy: employee._id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        clientId: createdClients[2]._id,
        items: [
          {
            productId: createdProducts[4]._id,
            qte: 1,
            prixUnitaire: createdProducts[4].prix,
            total: createdProducts[4].prix,
          },
        ],
        total: createdProducts[4].prix,
        statut: 'payé',
        createdBy: admin._id,
        date: new Date(),
      },
    ];

    // Update product quantities and create stock operations
    for (const invoice of invoices) {
      await Invoice.create(invoice);

      for (const item of invoice.items) {
        const product = await Product.findById(item.productId);
        product.quantite -= item.qte;
        await product.save();

        await StockOperation.create({
          productId: item.productId,
          type: 'OUT',
          quantite: item.qte,
          userId: invoice.createdBy,
          date: invoice.date,
          note: `Facture ${invoice._id || 'seed'}`,
        });
      }
    }

    console.log(`✅ Created ${invoices.length} invoices`);
    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@admin.com / admin1');
    console.log('   Employee: employee@employee.com / employee');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// Run if called directly
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}



