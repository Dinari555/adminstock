// Script d'initialisation MongoDB (optionnel, utilisé par docker-entrypoint-initdb.d)
// Le seed principal est géré par le script seed.js

db = db.getSiblingDB('depot_dashboard');

// Créer un utilisateur si nécessaire
db.createUser({
  user: 'depot_user',
  pwd: 'depot_password',
  roles: [{ role: 'readWrite', db: 'depot_dashboard' }],
});

print('✅ MongoDB database initialized');



