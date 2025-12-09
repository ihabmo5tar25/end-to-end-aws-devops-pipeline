# End-to-End AWS DevOps Automation Pipeline for Reciplore E-commerce

## Project Overview

This project implements a complete DevOps automation pipeline for Reciplore - a recipe discovery and e-commerce platform. The solution containerizes the application using Docker, orchestrates services with Kubernetes (Minikube), leverages AWS S3 for dataset storage, and implements full CI/CD automation with GitHub Actions. The platform features a React frontend, Express.js backend, Flask AI service for recipe recommendations, and MongoDB for data persistence, all monitored through Prometheus and Grafana.

## Objectives

- Automated Deployment: Implement full CI/CD pipeline with GitHub Actions for automated testing and deployment
- Containerization: Dockerize all application components (frontend, backend, AI service, database)
- Cloud Integration: Utilize AWS S3 for recipe dataset storage and management
- Local Orchestration: Set up Kubernetes cluster using Minikube for local development and testing
- Monitoring: Implement comprehensive monitoring with Prometheus and Grafana
- Scalability: Design architecture that can scale to production AWS EKS when needed
- Reproducibility: Ensure environment consistency through Infrastructure as Code practices

## Technology Stack

|  Category         |  Tools & Services              |
|-------------------|--------------------------------|
| Frontend          | React, Vite, JavaScript        |
| Backend           | Express.js, Node.js, pnpm      |
| AI (FURURE)       | Flask, Python, Pandas, Scikit-learn |
| Database          | MongoDB                        |
| Setup             | Ansible                        |
| Containerization  | Docker                         |
| Orchestration     | Docker Compose & Kubernetes (Minikube) |
| Cloud Services    | AWS For Deployment             |
| CI/CD             | GitHub Actions                 |
| VCS               | GIT                            | 
| Monitoring        | Prometheus, Grafana            |


## Data Flow Architecture

```ascii
┌─────────────┐    HTTP Requests    ┌─────────────┐    API Calls    ┌─────────────┐
│   User      │ ──────────────────► │  Frontend   │ ──────────────► │   Backend   │
│  (Browser)  │ ◄────────────────── │  (React)    │ ◄────────────── │ (Express.js)│
└─────────────┘    HTML/CSS/JS      └─────────────┘    JSON Data    └─────────────┘
                                                                         │
                                                                         │ Database Queries
                                        (FURURE)                                 ▼
┌─────────────┐    Recipe Data      ┌─────────────┐    Dataset       ┌─────────────┐
│   MongoDB   │ ◄────────────────── │   AI        │ ◄─────────────── │   AWS S3    │
│  (User Data)│ ──────────────────► │  Service    │    Sync          │(Recipe Data)│
└─────────────┘    Recommendations  │  (Flask)    │                  └─────────────┘
                                    └─────────────┘
```                               



#### Infrastructure Architecture:

```ascii
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                       │
│                     (Source Control)                        │
└──────────────┬──────────────────────────────────────────────┘
               │ Push/PR
               ▼
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Actions CI/CD                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Build   │→ │   Test   │→ │  Docker  │→ │  Deploy  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Docker Hub Registry                        │
│         (Container Image Storage)                           │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Kubernetes Cluster (Minikube)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                Application Layer                     │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐   │   │
│  │  │Frontend │  │ Backend │  │   AI    │  │MongoDB │   │   │
│  │  │ (React) │  │(Node.js)│  │(FUTURE) │  │        │   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Monitoring Layer                        │   │
│  │       ┌───────────┐        ┌──────────┐              │   │
│  │       │Prometheus │   ←→   │ Grafana  │              │   │
│  │       └───────────┘        └──────────┘              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                            │
│                  ┌──────────────┐                           │
│                  │  Deployment  │                           │
│                  │              │                           │
│                  └──────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Phased Implementation Plan (9 Phases)

### Phase 1: Project Setup & Repository Structure

#### Tasks:

- Clone the unified repository
- Set up local development environment
- Configure environment variables
- Verify project structure

#### Setup Commands:

```bash
# Clone the repository
git clone -b develop https://github.com/ihabmo5tar25/end-to-end-aws-devops-pipeline.git
cd end-to-end-aws-devops-pipeline

# Install dependencies for backend
cd backend
pnpm install

# Install dependencies for frontend
cd ../frontend
pnpm install

# Install dependencies for AI service (if needed)
cd ../ai
pip install -r requirements.txt

# Return to root directory
cd ..
```

### Phase 2: Containerization of All Services

#### Tasks:

- Build Docker images for all services
- Set up docker-compose for local development
- Test container builds and service communication
- Verify multi-container orchestration

#### Docker Setup:

**Backend Dockerfile** (`backend/Dockerfile`):

- Multi-stage build using Node.js 20 Alpine
- Installs pnpm and production dependencies
- Creates non-root user for security
- Exposes port 3000 with health checks

**Frontend Dockerfile** (`frontend/Dockerfile`):

- Multi-stage build: Node.js builder + Nginx production
- Builds React application with Vite
- Serves static files via Nginx
- Exposes port 80 with health checks

**AI Service Dockerfile** (`ai/Dockerfile`):

- Python-based Flask service
- Downloads dataset and models from AWS S3 on startup
- Exposes port 5000 for API endpoints

#### Docker Compose Setup:

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild and restart
docker compose up -d --build
```

The `docker-compose.yml` file orchestrates:

- MongoDB database service
- Backend API service (Express.js)
- Frontend web service (React + Nginx)
- Network isolation between services
- Volume mounts for persistent data

### Phase 3: Local Kubernetes Cluster Setup

#### Tasks:

- Install and configure Minikube
- Create Kubernetes namespaces
- Set up local storage classes
- Configure kubectl and Helm

#### Setup Script (scripts/setup-minikube.sh):

```bash
#!/bin/bash

echo "Setting up Minikube cluster for Reciplore..."

# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start Minikube with sufficient resources
minikube start --cpus=4 --memory=8192 --disk-size=20g

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Create namespaces
kubectl create namespace recipiore
kubectl create namespace monitoring

# Set up storage class
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
EOF

echo "Minikube setup completed successfully!"
echo "Cluster IP: $(minikube ip)"
```

### Phase 4: Kubernetes Deployment Configuration

#### Tasks:

- Create Kubernetes deployment manifests
- Set up services and ingress
- Configure ConfigMaps and Secrets
- Create persistent volume claims

#### Backend Deployment (kubernetes/backend/deployment.yaml):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recipiore-backend
  namespace: recipiore
  labels:
    app: recipiore-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: recipiore-backend
  template:
    metadata:
      labels:
        app: recipiore-backend
    spec:
      containers:
        - name: backend
          image: recipiore-backend:latest
          ports:
            - containerPort: 3000
          env:
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: connection-string
            - name: AI_SERVICE_URL
              value: "http://ai-service.recipiore.svc.cluster.local:5000"
            - name: NODE_ENV
              value: "production"
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: recipiore
spec:
  selector:
    app: recipiore-backend
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
```

### Phase 5: AI Service Implementation

> **Note**: This phase is planned for future implementation. The AI service will be developed to provide recipe recommendations using machine learning algorithms.

#### Tasks:

- Develop Flask AI service
- Implement recipe recommendation algorithm
- Set up dataset download from S3
- Create API endpoints

#### AI Service Implementation (ai-service/app.py):

```python
//this file will be add next

```

### Phase 6: CI/CD Pipeline Implementation

#### Tasks:

- Set up GitHub Actions workflows
- Configure automated testing
- Create build and deployment pipelines
- Implement environment-specific configurations

#### CI Pipeline (.github/workflows/ci.yml):

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    services:
      mongo:
        image: mongo:latest
        ports:
          - 27017:27017
        options: >-
          --health-cmd="mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20.17.0"

      - name: Install Bun
        run: curl -fsSL https://bun.sh/install | bash

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Wait for MongoDB
        run: |
          for i in {1..30}; do
            if mongosh "mongodb://mongo:27017" --eval "db.stats()" > /dev/null 2>&1; then
              echo "MongoDB is ready!"
              exit 0
            fi
            echo "Waiting for MongoDB..."
            sleep 2
          done
          echo "MongoDB did not become ready in time!"
          exit 1

      # BACKEND

      - name: Install backend dependencies
        working-directory: backend
        run: pnpm install

      - name: Run backend unit tests
        working-directory: backend
        env:
          PORT: 3000
          NODE_ENV: test
          DB_TEST: "mongodb://mongo:27017/recipiore-test"
        run: ~/.bun/bin/bun test

      - name: Run backend e2e tests
        working-directory: backend
        env:
          PORT: 3000
          NODE_ENV: test
          DB_TEST: "mongodb://mongo:27017/recipiore-test"
        run: ~/.bun/bin/bun test:e2e

      - name: Build backend Docker image
        working-directory: backend
        run: docker build -t recipiore-backend:latest .

      # FRONTEND

      - name: Install frontend dependencies
        working-directory: frontend
        run: pnpm install

      - name: Lint frontend code
        working-directory: frontend
        run: pnpm run lint

      - name: Build frontend
        working-directory: frontend
        run: pnpm run build

      - name: Build frontend Docker image
        working-directory: frontend
        run: docker build -t recipiore-frontend:latest .
```

### Phase 7: Monitoring and Logging Setup

#### Tasks:

- Deploy Prometheus and Grafana
- Set up application metrics
- Configure logging
- Create monitoring dashboards

#### Prometheus Configuration (monitoring/prometheus.yaml):

```yaml
//this file will be add next
```

### Phase 8: Security and Optimization

#### Tasks:

- Implement security best practices
- Set up network policies
- Optimize container images
- Configure resource limits

#### Network Policy (kubernetes/network-policy.yaml):

```yaml
//this file will be add next
```

### Phase 9: Documentation and Final Testing

#### Tasks:

- Complete project documentation
- Perform end-to-end testing
- Create deployment guides
- Prepare demonstration materials

#### Final Documentation Structure:

```text
docs/
├── SETUP.md
├── DEPLOYMENT.md
├── ARCHITECTURE.md
├── API.md
├── TROUBLESHOOTING.md
└── MONITORING.md
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Minikube (for Kubernetes deployment)
- AWS CLI configured (for S3 access)
- kubectl
- Node.js 20.17.0+
- Python 3.9+
- pnpm (Node.js package manager)
- Git v2.x

### Quick Start

1. **Clone the repository:**

   ```bash
   git clone -b develop https://github.com/ihabmo5tar25/end-to-end-aws-devops-pipeline.git
   cd end-to-end-aws-devops-pipeline
   ```

2. **Set up environment variables:**

   - Copy `backend/config/dev.env.example` to `backend/config/dev.env` and configure your settings
   - Configure MongoDB connection strings
   - Set up AWS credentials for S3 access (if using AI service)

3. **Start with Docker Compose:**

   ```bash
   docker compose up -d
   ```

   This will start:

   - MongoDB on port 27017
   - Backend API on port 3000
   - Frontend on port 80

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs (if configured)

For detailed deployment instructions, see [README.DOCKER.md](./README.DOCKER.md)

## 📝 License

---

## Summary

This comprehensive implementation plan provides a complete roadmap for deploying the Reciplore e-commerce platform with a robust DevOps pipeline. The architecture combines local Kubernetes for application orchestration with AWS cloud services for storage and scalability, creating a production-ready deployment suitable for showcasing DevOps expertise.

**Note**: This project is currently in development. Check back for updates!
