# System Scaling and Optimization Plan

## 1. Current State Assessment
We need to analyze the current system specifications and running services to ensure the server can handle the scaling tools.

**Required Actions (Please run these on the server and provide the output):**
1. `docker ps` - To list all running containers.
2. `lscpu` - To check CPU specifications.
3. `free -m` - To check available RAM.
4. `df -h` - To check available disk storage.

## 2. CI/CD Pipeline Strategy
Based on the need to scale and the tools mentioned (Jenkins, ArgoCD, GitHub Actions), here is the recommended approach:
- **Continuous Integration (CI):** We will use **GitHub Actions** for CI. It is easier to set up, requires zero resources on this server for the build process (saving CPU/RAM for the app), and seamlessly integrates with GitHub. We will build the Docker images in GitHub Actions and push them to a container registry (like Docker Hub or GitHub Container Registry).
- **Continuous Deployment (CD):** We will use **ArgoCD** deployed within the Kubernetes cluster. ArgoCD follows a GitOps approach, automatically pulling changes from the repository and applying them to the Kubernetes cluster.

*Alternative:* If you prefer keeping everything on-premise, we can install Jenkins on this server, but it will consume significant resources (RAM/CPU).

## 3. Kubernetes (K8s) & Infrastructure
- We will set up a lightweight Kubernetes distribution on this server (e.g., **K3s** or **Minikube**) to manage the containers, assuming this is a single-node deployment for now.
- **Load Balancing:** We will configure a Kubernetes Ingress Controller (like Nginx Ingress) as the Load Balancer to distribute incoming traffic among multiple backend pods.

## 4. Nginx Reverse Proxy
- The existing Nginx configuration on the host will be updated to route traffic.
- Nginx will act as an API Gateway, proxying requests to:
  - The Kubernetes Ingress (for the backend).
  - ArgoCD UI.
  - Any other future services.

## 5. Backend Scaling & Message Queues
- **Kafka for Sockets:** We will deploy Kafka (via Kubernetes or Docker Compose initially) to handle real-time socket events. When multiple backend pods are running, socket connections will be distributed across them. Kafka will act as a pub/sub system to share socket messages across all backend pods so users connected to different pods can still chat with each other.
- **Message Queue for Data Processing:** We will integrate **RabbitMQ** or **Redis BullMQ** (since Redis is already in the `docker-compose.yml`) for background data processing and saving chat messages to the database asynchronously. This will prevent the backend from "bugging out" or slowing down during high traffic.
- **Refactoring Chat:** The chat logic (`server/src/socket/chat.socket.ts`) will be refactored to push messages to the queue and Kafka instead of directly writing to the database or emitting directly without cross-node synchronization.

## 6. Execution Steps
1. Verify server resources.
2. Refactor backend codebase (socket sharing with Kafka, background processing queue).
3. Containerize the updated backend and set up GitHub Actions CI.
4. Install K3s (Kubernetes) and ArgoCD on the server.
5. Create Kubernetes manifests (Deployments, Services, Ingress) for Postgres, Redis, Kafka, and the Backend.
6. Configure Nginx on the host for routing.
