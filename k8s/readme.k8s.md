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
├── 06-ai-deployment.yaml
├── 07-ai-service.yaml
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
AI microservice pod.

07-ai-service.yaml  
Internal AI service.

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
- Backend → AI & Mongo only
- AI & Mongo are not publicly accessible

---

## Deployment Steps

1. Build and push images:
    ```bash
    docker compose -f docker-compose.build.yaml build 
    ```
2. Apply manifests:
    ```bash
    kubectl apply -f kubernetes/
    ```
3. Verify:
    ```bash
    kubectl get all -n reciplore
    ```
---


## Notes

- All deployments include only one pod for due to minimal available resources.
- Testing has been applied inside a minikube environment only.
