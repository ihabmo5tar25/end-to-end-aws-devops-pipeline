# End-to-End AWS DevOps Automation Pipeline for Reciplore E-commerce 

## Project Overview

This project implements a complete DevOps automation pipeline for Reciplore - a recipe discovery and e-commerce platform. The solution containerizes the application using Docker, orchestrates services with Kubernetes (Minikube), leverages AWS S3 for dataset storage, and implements full CI/CD automation with GitHub Actions. The platform features a React frontend, Express.js backend, Flask AI service for recipe recommendations, and MongoDB for data persistence, all monitored through Prometheus and Grafana.

##  Objectives
- Automated Deployment: Implement full CI/CD pipeline with GitHub Actions for automated testing and deployment
- Containerization: Dockerize all application components (frontend, backend, AI service, database)
- Cloud Integration: Utilize AWS S3 for recipe dataset storage and management
- Local Orchestration: Set up Kubernetes cluster using Minikube for local development and testing
- Monitoring: Implement comprehensive monitoring with Prometheus and Grafana
- Scalability: Design architecture that can scale to production AWS EKS when needed
- Reproducibility: Ensure environment consistency through Infrastructure as Code practices

## Technology Stack

| Category          | Tools & Services               |
|-------------------|--------------------------------|
| Frontend          | React, Vite, JavaScript        |
| Backend           | Express.js, Node.js, pnpm      |
| AI Service        | Flask, Python, Pandas, Scikit-learn |
| Database          | MongoDB                        |
| Containerization  | Docker                         |
| Orchestration     | Kubernetes (Minikube)          |
| Cloud Services    | AWS S3, AWS IAM, AWS CLI       |
| CI/CD             | GitHub Actions                 |
| Monitoring        | Prometheus, Grafana            |
| Data              | RecipeNLG Dataset (2GB CSV)    |


## Data Flow Architecture

User Request → Frontend (React) → Backend (Express.js) → AI Service (Flask)
      ↑                                  ↓                      ↓
      └──────←────── Response ←──────────┴──────←────── Recipe Recommendations
                             ↓
                         MongoDB (User Data)
                             ↓
                         AWS S3 (Recipe Dataset)
## System Architecture
![Architecture Diagram](images/architecture-diagram.png)  // We will add this image later

####  simple architecture just as a reference
┌─────────────────────────────────────────────────────────────────────────┐
│                             AWS Cloud                                   │
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│  │   S3 Bucket     │    │   IAM Roles     │    │   CloudWatch    │    │
│  │ (Recipe Dataset)│    │ (Permissions)   │    │  (Logging)      │    │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    │
│         │                      │                      │                │
│         │                      │                      │                │
│         ▼                      ▼                      ▼                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 Kubernetes Cluster (Minikube)                   │   │
│  │                                                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│   │
│  │  │   Frontend  │  │   Backend   │  │   AI Service│  │ MongoDB ││   │
│  │  │  (React)    │  │ (Express.js)│  │  (Flask)    │  │         ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

#### The architecture features :
//added next

## Phased Implementation Plan (10 Weeks)
### Week 1: Project Setup & Repository Structure
#### Tasks:

- Clone existing repositories
- Create unified project structure
- Set up documentation
- Initialize version control
#### Commands:
```bash
# Create main project directory
mkdir recipiore-devops-pipeline
cd recipiore-devops-pipeline

# Clone existing repositories
git clone https://github.com/yous0001/Graduation-Project backend
git clone https://github.com/yous0001/Reciplore-frontend frontend

# Create AI service directory
mkdir ai-service

# Create DevOps infrastructure
mkdir -p .github/workflows kubernetes/{backend,frontend,ai-service,database} scripts terraform monitoring docs

# Initialize main repository
git init
echo "# End-to-End DevOps Pipeline for Reciplore E-commerce" > README.md
```bash
### Week 2: Containerization of All Services
#### Tasks:

- Create Dockerfiles for all services
- Set up docker-compose for local development
- Test container builds
- Create container optimization scripts
#### Files:
##### 1- Backend Dockerfile (backend/Dockerfile):
```Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
```
##### 2- Frontend Dockerfile (frontend/Dockerfile):
```Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```
### Week 3: Local Kubernetes Cluster Setup
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
### Week 4: AWS Infrastructure Setup
#### Tasks:

- Create AWS S3 bucket for dataset
- Set up IAM roles and policies
- Configure AWS CLI
- Create Terraform configurations

#### Terraform Configuration (terraform/main.tf):
```hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "recipiore_dataset" {
  bucket = "recipiore-dataset-${var.environment}"

  tags = {
    Name        = "Reciplore Dataset Storage"
    Environment = var.environment
    Project     = "Reciplore"
  }
}
```


### Week 5: Kubernetes Deployment Configuration
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

### Week 6: AI Service Implementation
#### Tasks:

- Develop Flask AI service
- Implement recipe recommendation algorithm
- Set up dataset download from S3
- Create API endpoints

#### AI Service Implementation (ai-service/app.py):
```python
//this file will be add next

```

### Week 7: CI/CD Pipeline Implementation
#### Tasks:

- Set up GitHub Actions workflows
- Configure automated testing
- Create build and deployment pipelines
- Implement environment-specific configurations

#### CI Pipeline (.github/workflows/ci.yml):
```yaml
//this file will be add next
```

### Week 8: Monitoring and Logging Setup
#### Tasks:

- Deploy Prometheus and Grafana
- Set up application metrics
- Configure logging
- Create monitoring dashboards

#### Prometheus Configuration (monitoring/prometheus.yaml):

```yaml
//this file will be add next
```

### Week 9: Security and Optimization
#### Tasks:

- Implement security best practices
- Set up network policies
- Optimize container images
- Configure resource limits

#### Network Policy (kubernetes/network-policy.yaml):

```yaml
//this file will be add next
```

### Week 10: Documentation and Final Testing
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
- Minikube
- AWS CLI configured
- kubectl
- Node.js 18+
- Python 3.9+
- 
## How to Use / Deploy
[Instructions will be added as project progresses]

## 📝 License
---
## Summary
This comprehensive implementation plan provides a complete roadmap for deploying the Reciplore e-commerce platform with a robust DevOps pipeline. The architecture combines local Kubernetes for application orchestration with AWS cloud services for storage and scalability, creating a production-ready deployment suitable for showcasing DevOps expertise.


**Note**: This project is currently in development. Check back for updates!
