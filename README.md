# Adminstock - Système de Gestion de Dépôt de Fournitures Scolaires

Application complète MERN (MongoDB, Express, React, Node.js) pour la gestion d'un dépôt de fournitures scolaires avec authentification JWT, gestion des stocks, facturation et tableau de bord.

## 🚀 Fonctionnalités

- ✅ **Authentification sécurisée** : JWT avec refresh tokens, bcrypt pour les mots de passe
- ✅ **Gestion des rôles** : Admin (accès complet) et Employee (accès restreint)
- ✅ **Gestion des clients** : CRUD complet avec historique des commandes
- ✅ **Gestion des produits** : CRUD avec alertes de stock faible
- ✅ **Opérations de stock** : Entrées et sorties avec historique
- ✅ **Facturation** : Création automatique avec génération PDF
- ✅ **Tableau de bord** : Statistiques en temps réel, graphiques
- ✅ **Audit** : Logs de toutes les actions critiques
- ✅ **Tests** : Tests unitaires et d'intégration
- ✅ **CI/CD** : Pipeline Jenkins complet
- ✅ **Kubernetes** : Manifests pour déploiement en production
- ✅ **Docker** : Environnement de développement conteneurisé

## 📋 Prérequis

- Node.js >= 16.0.0
- Docker et Docker Compose
- Git

Pour le déploiement Kubernetes :
- Kubernetes cluster (minikube, GKE, EKS, AKS, etc.)
- kubectl configuré
- Docker Registry (Docker Hub, GHCR, etc.)

## 🏃 Démarrage rapide (Docker Compose)

### 1. Cloner le repository

```bash
git clone <repository-url>
cd Adminstock
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend` (voir `backend/.env.example`) :

```bash
cd backend
cp .env.example .env
# Éditez .env avec vos valeurs
```

### 3. Lancer avec Docker Compose

```bash
cd ..
docker-compose up --build
```

Cela va démarrer :
- MongoDB sur le port 27017
- Mongo Express sur le port 8081 (http://localhost:8081)
- Backend API sur le port 5000 (http://localhost:5000)
- Frontend React sur le port 3000 (http://localhost:3000)

### 4. Initialiser la base de données (seed)

Dans un nouveau terminal :

```bash
# Exécuter le seed dans le container backend
docker-compose exec backend npm run seed
```

Ou via l'API (en mode développement uniquement) :

```bash
curl -X POST http://localhost:5000/api/v1/seed
```

### 5. Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000/api/v1
- **Mongo Express** : http://localhost:8081

#### Identifiants par défaut (après seed)

- **Admin** :
  - Email: `admin@admin.com`
  - Mot de passe: `admin1`

- **Employee** :
  - Email: `employee@employee.com`
  - Mot de passe: `employee`

## 🧪 Tests

### Backend

```bash
cd backend
npm install
npm test
```

### Frontend

```bash
cd frontend
npm install
npm test
```

## 📦 Structure du projet

```
Adminstock/
├── backend/              # API Express.js
│   ├── src/
│   │   ├── models/       # Modèles Mongoose
│   │   ├── controllers/  # Contrôleurs
│   │   ├── routes/       # Routes Express
│   │   ├── middleware/   # Middleware (auth, error)
│   │   ├── services/     # Services (PDF)
│   │   ├── utils/        # Utilitaires (JWT)
│   │   ├── scripts/      # Scripts (seed)
│   │   └── server.js     # Point d'entrée
│   ├── tests/            # Tests Jest
│   ├── Dockerfile
│   └── package.json
├── frontend/             # Application React
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── pages/        # Pages
│   │   ├── context/      # Context API
│   │   ├── services/     # Services API
│   │   └── App.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── k8s/                  # Manifests Kubernetes
│   ├── namespace.yaml
│   ├── secret.yaml
│   ├── configmap.yaml
│   ├── mongo-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── deploy.sh
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

## 🐳 Développement local (sans Docker)

### Backend

```bash
cd backend
npm install
# Créer .env avec les variables d'environnement
npm run dev  # Port 5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev  # Port 3000
```

### MongoDB (local)

Installer MongoDB localement ou utiliser Docker :

```bash
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7.0
```

## 🚢 Déploiement Kubernetes

### 1. Configurer les secrets

Éditez `k8s/secret.yaml` avec vos valeurs :

```yaml
stringData:
  jwt-secret: votre-secret-jwt
  jwt-refresh-secret: votre-secret-refresh
  mongo-uri: votre-uri-mongodb
```

### 2. Configurer le registry Docker

Éditez les manifests `backend-deployment.yaml` et `frontend-deployment.yaml` :

```yaml
image: votre-registry.io/depot-dashboard-backend:latest
image: votre-registry.io/depot-dashboard-frontend:latest
```

### 3. Construire et pousser les images

```bash
# Backend
cd backend
docker build -t votre-registry.io/depot-dashboard-backend:latest .
docker push votre-registry.io/depot-dashboard-backend:latest

# Frontend
cd frontend
docker build -t votre-registry.io/depot-dashboard-frontend:latest .
docker push votre-registry.io/depot-dashboard-frontend:latest
```

### 4. Déployer

```bash
cd k8s
chmod +x deploy.sh
./deploy.sh
```

Ou manuellement :

```bash
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml
kubectl apply -f mongo-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

### 5. Vérifier le déploiement

```bash
kubectl get pods -n depot-dashboard
kubectl get services -n depot-dashboard
kubectl get ingress -n depot-dashboard
```

## 🔧 Configuration CI/CD (Jenkins)

Le pipeline Jenkins (`Jenkinsfile`) effectue :

1. Checkout du code
2. Installation des dépendances
3. Linting (backend + frontend)
4. Tests (backend + frontend)
5. Analyse SonarQube (optionnel)
6. Build des images Docker
7. Push vers le registry
8. Déploiement Kubernetes

### Configuration Jenkins

1. Créer un pipeline Jenkins
2. Configurer les credentials :
   - `docker-hub-credentials` : Credentials Docker Hub / Registry
   - `kubeconfig` : Fichier kubeconfig pour Kubernetes
3. Le pipeline utilisera automatiquement le `Jenkinsfile`

## 📚 API Documentation

### Endpoints principaux

- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/refresh` - Rafraîchir le token
- `POST /api/v1/auth/logout` - Déconnexion
- `GET /api/v1/health` - Health check

Voir `openapi.yaml` pour la documentation complète OpenAPI/Swagger.

## 🔒 Sécurité

- ✅ Hashage bcrypt des mots de passe
- ✅ JWT avec refresh tokens
- ✅ RBAC (Role-Based Access Control)
- ✅ Rate limiting sur les routes d'authentification
- ✅ Validation des entrées (express-validator)
- ✅ Helmet.js pour les en-têtes de sécurité
- ✅ CORS configuré
- ✅ MongoDB sanitization
- ✅ Audit logs pour les actions critiques

## 📝 Scripts disponibles

### Backend

- `npm start` - Démarrer en production
- `npm run dev` - Démarrer en mode développement (nodemon)
- `npm test` - Lancer les tests
- `npm run seed` - Initialiser la base de données
- `npm run lint` - Linter le code
- `npm run format` - Formater le code (Prettier)

### Frontend

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire pour la production
- `npm test` - Lancer les tests
- `npm run lint` - Linter le code

## 🗄️ Base de données

### Modèles

- **User** : Utilisateurs (admin, employee)
- **Client** : Clients
- **Product** : Produits avec stock
- **StockOperation** : Opérations de stock (entrée/sortie)
- **Invoice** : Factures
- **AuditLog** : Logs d'audit

## 🔄 Sauvegarde

Pour sauvegarder MongoDB :

```bash
docker-compose exec mongo mongodump \
  --username admin --password admin123 \
  --authenticationDatabase admin \
  --db depot_dashboard \
  --out /data/backup
```

Restauration :

```bash
docker-compose exec mongo mongorestore \
  --username admin --password admin123 \
  --authenticationDatabase admin \
  /data/backup/depot_dashboard
```

## 🐛 Dépannage

### Problèmes de connexion MongoDB

Vérifiez que MongoDB est démarré :

```bash
docker-compose ps
docker-compose logs mongo
```

### Problèmes de build Docker

Nettoyez les images et rebuild :

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Problèmes Kubernetes

Vérifiez les logs :

```bash
kubectl logs -n depot-dashboard deployment/backend
kubectl logs -n depot-dashboard deployment/frontend
kubectl describe pod -n depot-dashboard
```

## 📄 Licence

MIT

## 👥 Contributeurs

Contributions bienvenues ! Veuillez créer une issue ou une pull request.

## 📞 Support

Pour toute question ou problème, veuillez créer une issue sur le repository.



