# Script de demarrage pour Depot Dashboard
Write-Host "Demarrage de Depot Dashboard..." -ForegroundColor Green

# Verifier si MongoDB est en cours d'execution
Write-Host "`nVerification de MongoDB..." -ForegroundColor Yellow
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoTest.TcpTestSucceeded) {
        Write-Host "MongoDB est accessible sur localhost:27017" -ForegroundColor Green
    } else {
        Write-Host "MongoDB n'est pas accessible sur localhost:27017" -ForegroundColor Red
        Write-Host "Options:" -ForegroundColor Yellow
        Write-Host "   1. Installer MongoDB: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
        Write-Host "   2. Utiliser MongoDB Atlas (cloud) et modifier MONGO_URI dans backend/.env" -ForegroundColor Cyan
        Write-Host "   3. Demarrer MongoDB si deja installe: mongod" -ForegroundColor Cyan
        Write-Host ""
        $continue = Read-Host "Continuer quand meme? (o/N)"
        if ($continue -ne "o" -and $continue -ne "O") {
            Write-Host "Arret du script." -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "Impossible de verifier MongoDB" -ForegroundColor Yellow
}

# Creer le fichier .env si il n'existe pas
if (-not (Test-Path "backend\.env")) {
    Write-Host "`nCreation du fichier backend/.env..." -ForegroundColor Yellow
    $envContent = @"
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/depot_dashboard
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760
"@
    $envContent | Out-File -FilePath "backend\.env" -Encoding utf8
    Write-Host "Fichier .env cree" -ForegroundColor Green
}

# Creer le dossier uploads si il n'existe pas
if (-not (Test-Path "backend\uploads")) {
    New-Item -ItemType Directory -Path "backend\uploads" | Out-Null
    Write-Host "Dossier uploads cree" -ForegroundColor Green
}

# Installer les dependances si necessaire
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "`nInstallation des dependances backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "`nInstallation des dependances frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Demarrer les services
Write-Host "`nDemarrage des services..." -ForegroundColor Green

# Demarrer le backend
Write-Host "Demarrage du backend sur http://localhost:5000..." -ForegroundColor Cyan
$backendPath = Join-Path $PWD "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

# Attendre un peu avant de demarrer le frontend
Start-Sleep -Seconds 3

# Demarrer le frontend
Write-Host "Demarrage du frontend sur http://localhost:3000..." -ForegroundColor Cyan
$frontendPath = Join-Path $PWD "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Write-Host "`nServices demarres!" -ForegroundColor Green
Write-Host "`nAcces:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000/api/v1" -ForegroundColor Cyan
Write-Host "`nPour initialiser la base de donnees:" -ForegroundColor Yellow
Write-Host "   cd backend && npm run seed" -ForegroundColor Cyan
Write-Host "`nIdentifiants par defaut (apres seed):" -ForegroundColor Yellow
Write-Host "   Admin:    admin@admin.com / admin1" -ForegroundColor Cyan
Write-Host "   Employee: employee@employee.com / employee" -ForegroundColor Cyan
