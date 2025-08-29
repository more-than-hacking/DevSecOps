# 🎼 Docker Compose: Multi-Container Orchestration

## 🎯 What is Docker Compose?

Docker Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application's services, networks, and volumes. Then, with a single command, you create and start all the services from your configuration.

## 🔍 Why Use Docker Compose?

### **Problems with Manual Container Management**
```bash
# Without Docker Compose - Complex manual setup
docker network create myapp-network
docker volume create myapp-data

docker run -d --name database \
  --network myapp-network \
  -v myapp-data:/var/lib/postgresql/data \
  -e POSTGRES_DB=myapp \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  postgres:13

docker run -d --name redis \
  --network myapp-network \
  redis:6-alpine

docker run -d --name web \
  --network myapp-network \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:password@database:5432/myapp \
  -e REDIS_URL=redis://redis:6379 \
  myapp:latest

# This is error-prone, hard to manage, and difficult to reproduce
```

### **Docker Compose Solution**
```yaml
# docker-compose.yml - Simple, declarative configuration
version: '3.8'

services:
  database:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine

  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@database:5432/myapp
      REDIS_URL: redis://redis:6379
    depends_on:
      - database
      - redis

volumes:
  postgres_data:
```

```bash
# Single command to start everything
docker-compose up -d
```

## 🏗️ Docker Compose File Structure

### **Basic Structure**
```yaml
version: '3.8'  # Compose file format version

services:       # Define your application services
  service1:
    # Service configuration
  service2:
    # Service configuration

networks:       # Define custom networks (optional)
  network1:
    # Network configuration

volumes:        # Define named volumes (optional)
  volume1:
    # Volume configuration
```

### **Service Configuration Options**

#### **Image and Build**
```yaml
services:
  # Using pre-built image
  nginx:
    image: nginx:latest
    
  # Building from Dockerfile
  web:
    build: .
    
  # Building with context and Dockerfile
  api:
    build:
      context: ./api
      dockerfile: Dockerfile.prod
      args:
        - VERSION=1.0
```

#### **Ports and Networking**
```yaml
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"        # Host:Container
      - "443:443"
    expose:
      - "9000"           # Expose to other services only
    networks:
      - frontend
      - backend
```

#### **Environment Variables**
```yaml
services:
  app:
    image: myapp:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    env_file:
      - .env
      - .env.prod
```

#### **Volumes and Storage**
```yaml
services:
  database:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data    # Named volume
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro  # Bind mount
      - /tmp:/tmp                                  # Host path

volumes:
  postgres_data:
```

#### **Dependencies and Startup Order**
```yaml
services:
  web:
    image: myapp:latest
    depends_on:
      - database
      - redis
    restart: unless-stopped
    
  database:
    image: postgres:13
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🚀 Real-World Examples

### **Example 1: LAMP Stack**
```yaml
version: '3.8'

services:
  # Apache Web Server
  apache:
    image: httpd:2.4
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/local/apache2/htdocs
      - ./apache.conf:/usr/local/apache2/conf/httpd.conf
    depends_on:
      - php

  # PHP-FPM
  php:
    image: php:8.1-fpm
    volumes:
      - ./html:/var/www/html
    depends_on:
      - mysql

  # MySQL Database
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myapp
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  # phpMyAdmin
  phpmyadmin:
    image: phpmyadmin:latest
    environment:
      PMA_HOST: mysql
      PMA_USER: user
      PMA_PASSWORD: password
    ports:
      - "8080:80"
    depends_on:
      - mysql

volumes:
  mysql_data:
```

### **Example 2: Node.js + MongoDB + Redis**
```yaml
version: '3.8'

services:
  # Node.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongo:27017/myapp
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your-secret-key
    volumes:
      - ./logs:/app/logs
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  # MongoDB Database
  mongo:
    image: mongo:5.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    ports:
      - "27017:27017"

  # Redis Cache
  redis:
    image: redis:6-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:

networks:
  default:
    driver: bridge
```

## ⌨️ Docker Compose Commands

### **Basic Commands**

#### **Starting and Stopping Services**
```bash
# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Start specific services
docker-compose up web database

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

#### **Building and Rebuilding**
```bash
# Build or rebuild services
docker-compose build

# Build specific service
docker-compose build web

# Build without cache
docker-compose build --no-cache

# Start services and rebuild if needed
docker-compose up --build
```

#### **Service Management**
```bash
# List running services
docker-compose ps

# View service logs
docker-compose logs

# Follow logs for specific service
docker-compose logs -f web

# View logs for multiple services
docker-compose logs web database

# Execute command in running service
docker-compose exec web bash

# Run one-off command
docker-compose run web python manage.py migrate
```

### **Advanced Commands**

#### **Scaling Services**
```bash
# Scale service to multiple instances
docker-compose up --scale web=3

# Scale multiple services
docker-compose up --scale web=3 --scale worker=2
```

#### **Configuration Management**
```bash
# Validate compose file
docker-compose config

# View resolved configuration
docker-compose config --services

# Use specific compose file
docker-compose -f docker-compose.prod.yml up

# Use multiple compose files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 🌐 Networking in Docker Compose

### **Default Networking**
```yaml
# Docker Compose automatically creates a default network
version: '3.8'

services:
  web:
    image: nginx:latest
    # Can communicate with 'database' service by name
    
  database:
    image: postgres:13
    # Can communicate with 'web' service by name
```

### **Custom Networks**
```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    networks:
      - frontend
      - backend

  database:
    image: postgres:13
    networks:
      - backend

  cache:
    image: redis:6-alpine
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access
```

## 💾 Volume Management

### **Named Volumes**
```yaml
version: '3.8'

services:
  database:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/on/host
```

### **Bind Mounts**
```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    volumes:
      - ./html:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /var/log/nginx:/var/log/nginx
```

## 🔧 Environment Configuration

### **Environment Files**
```bash
# .env file
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: myapp:latest
    env_file:
      - .env
      - .env.local
    environment:
      - NODE_ENV=${NODE_ENV}
      - DATABASE_URL=${DATABASE_URL}
```

## 🔍 Debugging and Troubleshooting

### **Common Issues and Solutions**

#### **Service Won't Start**
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs service_name

# Check service configuration
docker-compose config

# Validate compose file
docker-compose config --quiet
```

#### **Network Issues**
```bash
# Test network connectivity
docker-compose exec web ping database

# Check network configuration
docker network ls
docker network inspect project_default

# Debug DNS resolution
docker-compose exec web nslookup database
```

## 🔒 Security Best Practices

### **Secrets Management**
```yaml
version: '3.8'

services:
  app:
    image: myapp:latest
    secrets:
      - db_password
      - api_key
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    external: true
```

### **Non-Root Users**
```yaml
version: '3.8'

services:
  app:
    image: myapp:latest
    user: "1000:1000"
    
  database:
    image: postgres:13
    user: postgres
```

## 🎯 Best Practices

### **1. File Organization**
- **Use environment-specific files**: `docker-compose.yml`, `docker-compose.prod.yml`
- **Keep secrets separate**: Use `.env` files and Docker secrets
- **Version your compose files**: Include in version control

### **2. Service Design**
- **One process per container**: Follow the single responsibility principle
- **Use health checks**: Monitor service health
- **Handle dependencies**: Use `depends_on` and health checks

### **3. Development Workflow**
- **Use bind mounts for development**: Enable live code reloading
- **Separate development and production configs**: Different optimizations
- **Use override files**: `docker-compose.override.yml` for local development

## 🚀 Next Steps

Now that you understand Docker Compose, let's explore:

1. **Networking** - Advanced container communication
2. **Volumes & Storage** - Data persistence strategies
3. **Image Optimization** - Performance techniques
4. **Security A-Z** - Complete security guide

---

*Docker Compose transforms complex multi-container deployments into simple, declarative configurations. It's essential for modern application development and deployment workflows.*