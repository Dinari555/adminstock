#!/bin/bash

set -e

echo "🚀 Deploying Depot Dashboard to Kubernetes..."

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

# Create secrets
echo "🔐 Creating secrets..."
kubectl apply -f secret.yaml

# Create configmap
echo "⚙️  Creating configmap..."
kubectl apply -f configmap.yaml

# Deploy MongoDB
echo "🍃 Deploying MongoDB..."
kubectl apply -f mongo-deployment.yaml

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB..."
kubectl wait --for=condition=ready pod -l app=mongo -n depot-dashboard --timeout=120s

# Deploy backend
echo "🔧 Deploying backend..."
kubectl apply -f backend-deployment.yaml

# Deploy frontend
echo "🎨 Deploying frontend..."
kubectl apply -f frontend-deployment.yaml

# Deploy ingress
echo "🌐 Deploying ingress..."
kubectl apply -f ingress.yaml

# Deploy HPA
echo "📈 Deploying HPA..."
kubectl apply -f hpa.yaml

echo "✅ Deployment complete!"
echo ""
echo "📋 Check status:"
echo "   kubectl get pods -n depot-dashboard"
echo "   kubectl get services -n depot-dashboard"
echo "   kubectl get ingress -n depot-dashboard"



