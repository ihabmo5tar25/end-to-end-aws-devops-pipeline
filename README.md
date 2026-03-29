# End-to-End AWS DevOps Automation Pipeline for Reciplore E-commerce

## Project Overview

This project implements a complete DevOps automation pipeline for Reciplore - a recipe discovery and e-commerce platform. The solution containerizes the application using Docker, orchestrates services with Docker Compose and Kubernetes (Minikube), and implements full CI/CD automation with GitHub Actions. The platform features a React frontend, Express.js backend, and MongoDB for data persistence, all monitored through Prometheus and Grafana. Infrastructure automation is handled through Ansible playbooks, and the project is designed to be deployed on AWS cloud infrastructure.

## Objectives

- Automated Deployment: Implement full CI/CD pipeline with GitHub Actions for automated testing and deployment
- Containerization: Dockerize all application components (frontend, backend, database)
- Infrastructure Automation: Use Ansible playbooks for infrastructure provisioning and configuration
- Local Orchestration: Set up Docker Compose for local development and Kubernetes cluster using Minikube for testing
- Monitoring: Implement comprehensive monitoring with Prometheus and Grafana
- Scalability: Design architecture that can scale to production AWS EKS when needed
- Reproducibility: Ensure environment consistency through Infrastructure as Code practices

## Technology Stack

| Category         | Tools & Services                       |
| ---------------- | -------------------------------------- |
| Frontend         | React, Vite, JavaScript                |
| Backend          | Express.js, Node.js, pnpm              |
| AI (FURURE)      | Flask, Python, Pandas, Scikit-learn    |
| Database         | MongoDB                                |
| Setup            | Ansible                                |
| Containerization | Docker                                 |
| Orchestration    | Docker Compose & Kubernetes (Minikube) |
| Cloud Services   | AWS For Deployment                     |
| CI/CD            | GitHub Actions                         |
| VCS              | GIT                                    |
| Monitoring       | Prometheus, Grafana                    |

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

- Create Kubernetes deployment manifests for all services
- Set up services and ingress for external access
- Configure ConfigMaps and Secrets for environment variables
- Create persistent volume claims for MongoDB
- Implement network policies for service isolation

#### Kubernetes Manifests Structure:

The Kubernetes manifests are located in the `k8s/` directory and follow this structure:

```
k8s/
├── 01-namespace.yaml          # Creates 'reciplore' namespace
├── 02-backend-config.yaml     # Backend ConfigMap (non-sensitive env vars)
├── 03-backend-secret.yaml     # Backend Secrets (MongoDB connection)
├── 04-backend-deployment.yaml # Backend application deployment
├── 05-backend-service.yaml    # Backend internal service
├── 08-frontend-deployment.yaml # Frontend UI deployment
├── 09-frontend-service.yaml   # Frontend internal service
├── 10-mongo-pvc.yaml          # MongoDB persistent volume claim
├── 11-mongo-deployment.yaml   # MongoDB deployment
├── 12-mongo-service.yaml      # MongoDB service
├── 13-ingress.yaml            # Ingress for external access
└── 14-network-policy.yaml     # Network policies for security
```

#### Key Configuration Details:

**Backend Deployment** (`k8s/04-backend-deployment.yaml`):

- Single replica (can be scaled as needed)
- Uses ConfigMap and Secrets for environment variables
- Health checks: readiness and liveness probes on `/health` endpoint
- Image: `baselabouelnour/backend-depi:latest`

**Frontend Deployment** (`k8s/08-frontend-deployment.yaml`):

- Single replica
- Serves React application via Nginx
- Exposes port 80

**MongoDB Deployment** (`k8s/11-mongo-deployment.yaml`):

- Single replica with persistent storage
- Uses PVC for data persistence
- Exposes port 27017

**Network Policy** (`k8s/14-network-policy.yaml`):

- Implements zero-trust networking
- Frontend → Backend only
- Backend → MongoDB only
- Services are isolated and not publicly accessible except through Ingress

#### Deployment Steps:

1. **Install Calico** (required for NetworkPolicy support):

   ```bash
   kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/tigera-operator.yaml
   ```

2. **Apply all Kubernetes manifests**:

   ```bash
   kubectl apply -f k8s/
   ```

3. **Verify deployment**:

   ```bash
   kubectl get all -n reciplore
   kubectl get pods -n reciplore
   ```

4. **Check service status**:
   ```bash
   kubectl get svc -n reciplore
   kubectl get ingress -n reciplore
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

#### Core CI/CD Features:

The CI/CD pipeline implements the following core features:

**Automated Testing:**

- Backend unit tests execution using Bun test framework
- Backend end-to-end (e2e) tests for API integration
- Frontend code linting with ESLint
- MongoDB service integration for test database

**Build Automation:**

- Automated Docker image builds for backend and frontend services
- Multi-stage Docker builds for optimized production images
- Image tagging and versioning

**Quality Assurance:**

- Code quality checks before deployment
- Automated test execution on every push and pull request
- Prevents merging of broken code

**Deployment Readiness:**

- Validates all services build successfully
- Ensures Docker images are production-ready
- Prepares artifacts for deployment to Kubernetes or cloud infrastructure

**Workflow Triggers:**

- Runs on push to `main` branch
- Runs on pull requests to `main` branch
- Provides feedback on code changes before merging

**Service Management:**

- MongoDB service container for testing
- Health checks and service readiness validation
- Isolated test environments

#### CI Pipeline (.github/workflows/ci.yml):

```yaml
name: CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

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
          --health-retries=10

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.17.0'

      - name: Install Bun
        run: |
          curl -fsSL https://bun.sh/install | bash
          echo "$HOME/.bun/bin" >> $GITHUB_PATH

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install backend dependencies
        working-directory: backend
        run: pnpm install

      - name: Run backend unit tests
        working-directory: backend
        env:
          PORT: 3000
          NODE_ENV: test
          DB_TEST: "mongodb://localhost:27017/graduationproject_test"
        run: bun test

      - name: Run backend e2e tests
        working-directory: backend
        env:
          PORT: 3000
          NODE_ENV: test
          DB_TEST: "mongodb://localhost:27017/graduationproject_test"
        run: bun test:e2e

      - name: Build backend Docker image
        working-directory: backend
        run: docker build -t recipiore-backend:latest .

      - name: Log in to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Push backend Docker image to Docker Hub
        working-directory: backend
        run: |
          docker tag recipiore-backend:latest ${{ secrets.DOCKERHUB_USERNAME }}/recipiore-backend:latest
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/recipiore-backend:latest

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

### Phase 7: Monitoring and Logging Setup (future)
> This Section is future-proof, to be done in the next phases.

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

#### Completed Tasks:

**Documentation:**

- ✅ Main project documentation (`README.md`) with complete project overview, architecture, and setup instructions
- ✅ Docker deployment guide (`README.DOCKER.md`) with detailed Docker Compose setup and usage
- ✅ Kubernetes deployment guide (`k8s/README.MD`) with manifest descriptions and deployment steps
- ✅ Backend documentation (`backend/README.md`) with API features and setup
- ✅ Frontend documentation (`frontend/README.md`) with frontend-specific information
- ✅ Comprehensive Getting Started guide with prerequisites and quick start instructions
- ✅ Phased implementation plan documenting all 9 phases

**Testing Infrastructure:**

- ✅ Backend end-to-end (e2e) tests implemented using Bun test framework
- ✅ Test suites covering: Authentication, Banners, Categories, Countries, Recipes, Recommendations
- ✅ Test server setup (`backend/tests/e2e/setupServer.js`) for isolated test environments
- ✅ Database test utilities for test data management
- ✅ CI/CD pipeline integration for automated test execution
- ✅ Frontend linting setup with ESLint for code quality

**Deployment Guides:**

- ✅ Docker Compose deployment guide with service orchestration
- ✅ Kubernetes deployment guide with step-by-step instructions
- ✅ Network isolation documentation
- ✅ Environment variable configuration guides

**Testing Coverage:**

- ✅ Backend API e2e tests for core functionality
- ✅ Automated testing in CI/CD pipeline
- ✅ Health check endpoints for service monitoring
- ✅ Database initialization and migration scripts

#### Documentation Structure:

```
Project Root/
├── README.md                    # Main project documentation
├── README.DOCKER.md             # Docker deployment guide
├── backend/
│   ├── README.md                # Backend API documentation
│   └── tests/
│       └── e2e/                 # End-to-end test suites
│           ├── app.e2e.spec.js
│           ├── auth.e2e.spec.js
│           ├── banner.e2e.spec.js
│           ├── category.e2e.spec.js
│           ├── country.e2e.spec.js
│           ├── recipe.e2e.spec.js
│           ├── recommendation.e2e.spec.js
│           └── setupServer.js
├── frontend/
│   └── README.md                # Frontend documentation
└── k8s/
    └── README.MD                # Kubernetes deployment guide
```

#### Testing Commands:

**Backend Testing:**

```bash
# Run all tests
cd backend
bun test

# Run e2e tests only
bun test:e2e

# Run specific test file
bun test tests/e2e/auth.e2e.spec.js
```

**Frontend Testing:**

```bash
# Lint frontend code
cd frontend
pnpm run lint
```

**CI/CD Testing:**

- Tests run automatically on every push and pull request
- MongoDB service container provides isolated test database
- All tests must pass before code can be merged

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
   - Set up AWS credentials for deployment (if deploying to AWS)

3. **Start with Docker Compose:**

   ```bash
   docker compose up -d
   ```

   This will start:

   - MongoDB on port 27017
   - Backend API on port 3000
   - Frontend on port 80

4. **Access the application:**
   - Frontend: [http://localhost](http://ec2-18-191-139-42.us-east-2.compute.amazonaws.com/)
   - Backend API: 
   - API Documentation:

For detailed deployment instructions, see [README.DOCKER.md](./README.DOCKER.md)

## 📝 License

---

## Summary

This comprehensive implementation plan provides a complete roadmap for deploying the Reciplore e-commerce platform with a robust DevOps pipeline. The architecture combines local Kubernetes for application orchestration with AWS cloud services for storage and scalability, creating a production-ready deployment suitable for showcasing DevOps expertise.

**Note**: This project is currently in development. Check back for updates!
