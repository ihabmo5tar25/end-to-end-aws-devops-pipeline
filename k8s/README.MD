# Kubernetes Deployment – Reciplore Project - 
> This is a possible upgrade to be done, not applied yet.

This directory contains the Kubernetes manifests to deploy the Reciplore application on a kubernetes cluster. Each service runs as a single replica with strict network isolation, the network solution used is `Calico`.

---

## Directory Structure using `tree`
```bash
kubernetes/
├── 01-namespace.yaml
├── 02-backend-config.yaml
├── 03-backend-secret.yaml
├── 04-backend-deployment.yaml
├── 05-backend-service.yaml
├── 06-ai-deployment.yaml          # Future: AI service deployment
├── 07-ai-service.yaml             # Future: AI service
├── 08-frontend-deployment.yaml
├── 09-frontend-service.yaml
├── 10-mongo-pvc.yaml
├── 11-mongo-deployment.yaml
├── 12-mongo-service.yaml
├── 13-ingress.yaml
├── 14-network-policy.yaml
├── docker-compose.build.yaml
└── README.md
```
---

## Calico Installation
> Network solution used to apply the network policy.

Calico is required to enforce NetworkPolicies.

1. Install Calico Operator:
    ```bash
    kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/tigera-operator.yaml
    ```
2. Create Calico installation file:
    ```bash
    kubectl apply -f calico-installation.yaml
    ```
3. Verify:
    ```bash
    kubectl get pods -n calico-system
    ```

---

## Manifest Summary 

01-namespace.yaml  
Creates the project namespace.

02-backend-config.yaml  
Non-sensitive backend environment variables.

03-backend-secret.yaml  
Backend secrets (MongoDB connection).

04-backend-deployment.yaml  
Backend application pod.

05-backend-service.yaml  
Internal backend service.

06-ai-deployment.yaml  
AI microservice pod (Future implementation - not currently deployed).

07-ai-service.yaml  
Internal AI service (Future implementation - not currently deployed).

08-frontend-deployment.yaml  
Frontend UI pod.

09-frontend-service.yaml  
Frontend internal service.

10-mongo-pvc.yaml  
Persistent storage for MongoDB.

11-mongo-deployment.yaml  
MongoDB Deployment.

12-mongo-service.yaml  
MongoDB service.

13-ingress.yaml  
External access to the frontend.

14-network-policy.yaml  
Implements zero-trust networking:
- Frontend → Backend only
- Backend → MongoDB only
- Services are isolated and not publicly accessible except through Ingress

---

## Deployment Steps

1. Build and push images:
    ```bash
    docker compose -f docker-compose.build.yaml build 
    ```
   Note: AI service build is commented out as it's not currently deployed.

2. Apply manifests (excluding AI service files 06 and 07):
    ```bash
    kubectl apply -f k8s/01-namespace.yaml
    kubectl apply -f k8s/02-backend-config.yaml
    kubectl apply -f k8s/03-backend-secret.yaml
    kubectl apply -f k8s/04-backend-deployment.yaml
    kubectl apply -f k8s/05-backend-service.yaml
    kubectl apply -f k8s/08-frontend-deployment.yaml
    kubectl apply -f k8s/09-frontend-service.yaml
    kubectl apply -f k8s/10-mongo-pvc.yaml
    kubectl apply -f k8s/11-mongo-deployment.yaml
    kubectl apply -f k8s/12-mongo-service.yaml
    kubectl apply -f k8s/13-ingress.yaml
    kubectl apply -f k8s/14-network-policy.yaml
    ```
   Or apply all at once (AI files are commented out):
    ```bash
    kubectl apply -f k8s/
    ```

3. Verify:
    ```bash
    kubectl get all -n reciplore
    kubectl get pods -n reciplore
    kubectl get svc -n reciplore
    ```
---


## Notes

- All deployments include only one pod due to minimal available resources.
- Testing has been applied inside a minikube environment only.
- AI service files (06-ai-deployment.yaml and 07-ai-service.yaml) are commented out for future implementation.
- Network policy enforces Frontend → Backend → MongoDB communication only.
