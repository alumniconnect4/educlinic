# BFGI DevOps, Kubernetes & Nginx Architecture

## 1. Production Hosting Topology

The BFGI platform separates frontend edge delivery from stateful backend processing:

1. **Frontend Applications (Vercel Edge Network)**:
   - Next.js Alumni Portal (`client`)
   - React/Vite Community & Chat App (`chat-app`)
   - React/Vite Admin Management Portal (`admin-portal`)
   - Hosted with automated CI/CD deployments directly from Git repositories.

2. **Backend Services (Dedicated Kubernetes Cluster / Bare Metal)**:
   - Node.js / Express API instances running in Docker containers.
   - **3 default backend pod replicas** configured in the Kubernetes deployment manifest.
   - **Horizontal Pod Autoscaling (HPA)** scales the replica count up or down based on CPU and request load.
   - **Nginx Edge Proxy** terminates SSL (port 2087) and distributes traffic across backend pods.
   - **Apache Kafka** coordinates cross-replica real-time WebSocket broadcasts.
   - **PostgreSQL & Redis** handle relational data and caching.

---

## 2. Global Traffic and Network Flow

```
   [User Browser / Mobile Client]
                 │
       ┌─────────┴─────────┐
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────────────────────────────────────┐
│ Vercel Edge  │    │           Edge Nginx Reverse Proxy           │
│ Network (CDN)│    │      (api.h4x.co.in / SSL Port 2087)         │
│ Frontends    │    └──────────────────────┬───────────────────────┘
└──────────────┘                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │          Kubernetes Ingress Controller       │
                    │           (nginx-ingress / NodePort)         │
                    └──────────────────────┬───────────────────────┘
                                           │
                     ┌─────────────────────┼─────────────────────┐
                     │                     │                     │
                     ▼                     ▼                     ▼
              ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
              │Backend Pod #1│      │Backend Pod #2│      │Backend Pod #3│
              │(Replica 1)   │      │(Replica 2)   │      │(Replica 3)   │
              └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
                     │                     │                     │
                     └─────────────────────┼─────────────────────┘
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
              ┌──────────────┐                            ┌──────────────┐
              │ Apache Kafka │                            │PostgreSQL 16 │
              │ Broker & ZK  │                            │& Redis Cache │
              └──────────────┘                            └──────────────┘
```

---

## 3. Nginx Edge Reverse Proxy (`nginx/nginx.conf`)

The edge Nginx server serves as the entry point for all API and WebSocket requests originating from the Vercel-hosted frontends:

- **SSL/TLS Termination**: Managed with Let's Encrypt certificates using TLSv1.2 and TLSv1.3 protocols.
- **WebSocket Upgrade Routing**: Proxies HTTP/1.1 connections with `Upgrade` and `Connection: "upgrade"` headers to maintain persistent bi-directional WebSocket pipes.
- **Large Payload Buffer**: Configured with `client_max_body_size 100M;` and `client_body_buffer_size 100M;` to support bulk high-resolution photo uploads without truncation.
- **Extended Timeouts**: Proxy connect/read/send timeouts set to `300s` to prevent timeouts during long-running batch operations.

---

## 4. Kubernetes Deployment & Autoscaling (`k8s/`)

### 4.1 Deployment Specification (`k8s/backend.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: educlinic-backend
  labels:
    app: educlinic-backend
spec:
  replicas: 3 # Default 3 instances
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: educlinic-backend
  template:
    metadata:
      labels:
        app: educlinic-backend
    spec:
      containers:
        - name: educlinic-backend
          image: ghcr.io/alumniconnect4/educlinic-backend:latest
          ports:
            - containerPort: 4000
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          livenessProbe:
            httpGet:
              path: /api/stats/health
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/stats/health
              port: 4000
            initialDelaySeconds: 10
            periodSeconds: 5
```

### 4.2 Horizontal Pod Autoscaler (HPA)

Under heavy traffic (e.g., major college announcements, event ticketing opening, or active chat sessions), Kubernetes HPA monitors pod metrics and automatically scales from the baseline of 3 pods up to 10+ pods:

```bash
# Apply HPA rule: target 70% average CPU utilization
kubectl autoscale deployment educlinic-backend --cpu-percent=70 --min=3 --max=10
```

### 4.3 GitOps Deployment with ArgoCD (`k8s/argocd-app.yml`)

- **Automated Image Tracking**: ArgoCD Image Updater continuously tracks the GitHub Container Registry (`ghcr.io/alumniconnect4/educlinic-backend:latest`).
- **Declarative GitOps**: Whenever a new container image is pushed by GitHub Actions, ArgoCD automatically triggers a zero-downtime rolling update on the Kubernetes cluster.

---

## 5. Local Docker Compose Workflow

For local development and testing, `docker-compose.yml` provides full multi-service parity with production:

```bash
# Start backend, database, redis, and kafka services
docker compose up -d

# Inspect live cluster logs
docker compose logs -f server

# Stop local stack
docker compose down
```

### Services Mapping:
- **`server`**: Port `4000` (Node.js API & Socket.io)
- **`db`**: Port `5432` (PostgreSQL 16)
- **`redis`**: Port `6379` (Redis 7 Cache & BullMQ Queue)
- **`kafka`**: Port `9092` (Apache Kafka Event Streaming Broker)
- **`zookeeper`**: Port `2181` (Kafka Cluster Manager)
