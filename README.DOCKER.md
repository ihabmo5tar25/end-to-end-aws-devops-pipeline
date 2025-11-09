# Docker Setup for Reciplore

This project includes Docker Compose configuration for easy deployment and development.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- Docker version 20.10+ and Docker Compose version 2.0+

## Quick Start

1. **Ensure Docker Desktop is running**

2. **Build and start all services:**

   ```bash
   docker compose build
   docker compose up -d
   ```

   Or build and start in one command:

   ```bash
   docker compose up -d --build
   ```

3. **Access the application:**

   - **Frontend:** http://localhost:8080
   - **Backend API:** http://localhost:3000
   - **MongoDB:** localhost:27017 (internal use)

4. **View logs:**

   ```bash
   # All services
   docker compose logs -f

   # Specific service
   docker compose logs -f backend
   docker compose logs -f frontend
   docker compose logs -f mongodb
   ```

5. **Stop all services:**

   ```bash
   docker compose down
   ```

6. **Stop and remove volumes (clean slate):**

   ```bash
   docker compose down -v
   ```

## Services

### MongoDB (Database)

- **Container:** `reciplore-mongodb`
- **Image:** `mongo:7.0`
- **Port:** 27017 (configurable via `MONGO_PORT` environment variable)
- **Default Credentials:**
  - Username: `admin`
  - Password: `password123`
  - Database: `graduationproject`
- **Data Persistence:** Stored in Docker volumes:
  - `mongodb_data` - Database data
  - `mongodb_config` - Configuration data
- **Health Check:** MongoDB ping every 10 seconds
- **Connection String (for backend):** `mongodb://admin:password123@mongodb:27017/graduationproject?authSource=admin`

### Backend (Node.js/Express)

- **Container:** `reciplore-backend`
- **Port:** 3000 (configurable via `BACKEND_PORT` environment variable)
- **Package Manager:** pnpm (installed via npm)
- **Build:** Multi-stage build using `backend/Dockerfile`
- **Health Check:** Available at `http://localhost:3000/test` (checks every 30 seconds)
- **Environment Variables:** Loaded from `backend/config/dev.env` via `env_file`
- **Database Connection:**
  - Uses local MongoDB container by default
  - Connection configured via `CONNECTION_URL_LOCAL` environment variable
  - Can be switched to MongoDB Atlas by setting `CONNECTION_URL_DEPLOY` in `dev.env`
- **Volumes:**
  - `./backend/uploads:/app/uploads` - File uploads directory

### Frontend (React/Vite)

- **Container:** `reciplore-frontend`
- **Port:** 8080 (mapped from container port 80, configurable via `FRONTEND_PORT`)
- **Package Manager:** pnpm (installed via npm)
- **Build:** Multi-stage build:
  - Stage 1: Node.js build with Vite
  - Stage 2: Nginx Alpine serving static files
- **Health Check:** Available at `http://localhost/health` (checks every 30 seconds)
- **Build Args:**
  - `VITE_BACKEND_URL` - Backend API URL (default: `http://localhost:3000`)
- **Dependencies:** wget installed for health checks

## Network

All services are connected to a Docker network named `reciplore-network` (bridge driver). Services can communicate with each other using their service names:

- Backend connects to MongoDB using: `mongodb:27017`
- Frontend can access backend via: `http://backend:3000` (internal) or `http://localhost:3000` (from host)

## Environment Variables

### Backend Environment Variables

The backend loads environment variables from `backend/config/dev.env`. Key variables include:

- **Database Connection:**

  - `CONNECTION_URL_DEPLOY` - MongoDB Atlas connection string (optional)
  - `CONNECTION_URL_LOCAL` - Local MongoDB connection string (default)
  - `DB_TEST` - Test database connection string

- **Application:**

  - `PORT` - Backend port (default: 3000)
  - `NODE_ENV` - Environment mode (development/production)
  - `CLIENT_URL` - Frontend URL for CORS

- **JWT Secrets:**

  - `JWT_SECRET_LOGIN` - Login token secret
  - `JWT_SECRET_refresh` - Refresh token secret
  - `JWT_SECRET_VERFICATION` - Verification token secret
  - `TOKEN_PREFIX` - Token prefix
  - `ACCESS_TOKEN_EXPIRATION` - Token expiration time
  - `SALT_ROUNDS` - Bcrypt salt rounds

- **Cloudinary (Image Upload):**

  - `API_key` - Cloudinary API key
  - `API_secret` - Cloudinary API secret
  - `Cloud_name` - Cloudinary cloud name

- **Email (Nodemailer):**

  - `EMAIL` - Email address
  - `EMAIL_PASSWORD` - Email password

- **Payment (Stripe):**

  - `STRIPE_SECRET_KEY` - Stripe secret key

- **AI Services:**
  - `GEMINI_API_KEY` - Google Gemini API key
  - `OPENAI_API_KEY` - OpenAI API key
  - `HUGGINGFACE_TOKEN1-10` - Hugging Face tokens

### Docker Compose Environment Variables

You can override defaults using environment variables or a `.env` file:

- `MONGO_ROOT_USERNAME` - MongoDB root username (default: `admin`)
- `MONGO_ROOT_PASSWORD` - MongoDB root password (default: `password123`)
- `MONGO_DATABASE` - MongoDB database name (default: `graduationproject`)
- `MONGO_PORT` - MongoDB exposed port (default: `27017`)
- `BACKEND_PORT` - Backend exposed port (default: `3000`)
- `FRONTEND_PORT` - Frontend exposed port (default: `8080`)
- `VITE_BACKEND_URL` - Backend URL for frontend build (default: `http://localhost:3000`)

## Database Configuration

### Using Local MongoDB Container (Default)

The backend is configured to use the local MongoDB container by default. The connection is set via:

```yaml
CONNECTION_URL_LOCAL: mongodb://admin:password123@mongodb:27017/graduationproject?authSource=admin
```

### Switching to MongoDB Atlas

To use MongoDB Atlas instead of the local container:

1. Ensure `CONNECTION_URL_DEPLOY` is set in `backend/config/dev.env` with your Atlas connection string
2. The backend code automatically prefers `CONNECTION_URL_DEPLOY` over `CONNECTION_URL_LOCAL` if both are set
3. You can also unset `CONNECTION_URL_DEPLOY` in docker-compose.yml to force local MongoDB

The connection logic in `backend/DB/connnection.js`:

```javascript
const uri = isTestEnv
  ? process.env.DB_TEST
  : process.env.CONNECTION_URL_DEPLOY || process.env.CONNECTION_URL_LOCAL;
```

## Build Process

### Backend Build

1. Installs pnpm globally via npm
2. Copies `package.json` and `pnpm-lock.yaml`
3. Installs production dependencies with `pnpm install --frozen-lockfile --prod`
4. Copies application code
5. Creates non-root user for security
6. Exposes port 3000

### Frontend Build

1. **Builder Stage:**

   - Installs pnpm globally via npm
   - Copies `package.json` and `pnpm-lock.yaml`
   - Installs all dependencies with `pnpm install --frozen-lockfile`
   - Copies application code
   - Builds with Vite using `pnpm run build`

2. **Production Stage:**
   - Uses nginx:alpine base image
   - Installs wget for health checks
   - Copies built assets from builder stage
   - Configures nginx with SPA routing and health endpoint
   - Exposes port 80

## Health Checks

All services include health checks to ensure proper startup order:

- **MongoDB:** Ping check every 10 seconds
- **Backend:** HTTP GET to `/test` endpoint every 30 seconds
- **Frontend:** HTTP GET to `/health` endpoint every 30 seconds

Startup dependencies:

- Backend waits for MongoDB to be healthy
- Frontend waits for Backend to be healthy

## Development vs Production

### Development

- Use `docker-compose.yml` for local development
- Backend automatically loads `backend/config/dev.env` when `NODE_ENV` is not "production"
- All environment variables are loaded from `dev.env` file
- Hot reload can be enabled by mounting source code volumes (not included by default)

### Production

- Set `NODE_ENV=production` in environment
- Ensure all secrets and API keys are set in `dev.env` or via environment variables
- Consider using secrets management instead of `.env` file for sensitive data
- Use reverse proxy (nginx/traefik) in front of services
- Enable HTTPS/TLS
- Review and secure all exposed ports

## Troubleshooting

### Check service status:

```bash
docker compose ps
```

### View service logs:

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb

# Last 50 lines
docker compose logs --tail 50 backend
```

### Access MongoDB shell:

```bash
docker compose exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

Or using the container name:

```bash
docker exec -it reciplore-mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

### Access backend container:

```bash
docker compose exec backend sh
```

Or:

```bash
docker exec -it reciplore-backend sh
```

### Access frontend container:

```bash
docker compose exec frontend sh
```

Or:

```bash
docker exec -it reciplore-frontend sh
```

### Check environment variables:

```bash
# Backend environment variables
docker compose exec backend env

# Check specific variable
docker compose exec backend printenv CONNECTION_URL_LOCAL
```

### Rebuild a specific service:

```bash
# Rebuild backend
docker compose build backend
docker compose up -d backend

# Rebuild frontend
docker compose build frontend
docker compose up -d frontend

# Rebuild all
docker compose build
docker compose up -d
```

### View resource usage:

```bash
docker stats
```

### Restart a service:

```bash
docker compose restart backend
docker compose restart frontend
```

### Check which database is being used:

```bash
docker compose exec backend node -e "const uri = process.env.CONNECTION_URL_DEPLOY || process.env.CONNECTION_URL_LOCAL; console.log('Using:', uri.includes('cluster0') ? 'MongoDB Atlas' : 'Local MongoDB');"
```

## File Structure

```
reciplore/
├── docker-compose.yml           # Main compose file
├── backend/
│   ├── Dockerfile               # Backend container definition
│   ├── .dockerignore            # Files to exclude from build
│   ├── package.json             # Backend dependencies
│   ├── pnpm-lock.yaml           # pnpm lock file
│   └── config/
│       └── dev.env              # Backend environment variables
└── frontend/
    ├── Dockerfile               # Frontend container definition
    ├── .dockerignore            # Files to exclude from build
    ├── package.json             # Frontend dependencies
    └── pnpm-lock.yaml           # pnpm lock file
```

## Important Notes

- **Package Manager:** This project uses **pnpm** instead of npm. Both Dockerfiles install pnpm globally before building.
- **Frontend Port:** Default frontend port is **8080** (not 80) to avoid conflicts
- **Backend Port:** Default backend port is **3000**
- **Environment Variables:** Backend loads all environment variables from `backend/config/dev.env` via `env_file` directive
- **Database:** By default, the backend connects to the local MongoDB container. To use MongoDB Atlas, ensure `CONNECTION_URL_DEPLOY` is properly configured in `dev.env`
- **Health Checks:** All services have health checks configured. Frontend health check requires `wget` which is installed in the Dockerfile
- **Build Time:** Frontend builds are static (Vite), so `VITE_BACKEND_URL` must be set at build time via build args
- **Data Persistence:** MongoDB data persists in Docker volumes even when containers are stopped
- **Startup Order:** Health checks ensure services start in the correct order (MongoDB → Backend → Frontend)
- **Auto-restart:** All services restart automatically unless stopped manually (`restart: unless-stopped`)
- **Network:** All services communicate via the `reciplore-network` bridge network

## Common Commands Reference

```bash
# Build all services
docker compose build

# Start all services in detached mode
docker compose up -d

# Build and start
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# View logs
docker compose logs -f

# Restart a service
docker compose restart backend

# Rebuild and restart a service
docker compose build backend && docker compose up -d backend

# Check service health
docker compose ps

# Execute command in container
docker compose exec backend sh
```
