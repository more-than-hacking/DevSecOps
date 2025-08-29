# ⌨️ Basic Docker Commands: Essential Operations

## 🎯 Getting Started with Docker Commands

Docker commands are your primary interface with the Docker system. Understanding these essential commands will help you build, run, and manage containers effectively. Let's explore the most important Docker commands organized by category.

## 🐳 Docker System Commands

### **1. Docker Version and Info**

#### **Check Docker Version**
```bash
# Check Docker version
docker version

# Output:
# Client: Docker Engine - Community
#  Version:           20.10.21
#  API version:       1.41
#  Go version:        go1.18.7
#  Git commit:        baeda1f
#  Built:             Tue Oct 25 18:01:16 2022
#  OS/Arch:           linux/amd64
#  Context:           default
#  Experimental:      false

# Check Docker info
docker info

# Output includes:
# - Containers: 0
# - Images: 0
# - Docker Root Dir: /var/lib/docker
# - Storage Driver: overlay2
# - Kernel Version: 5.15.0-52-generic
```

#### **Docker System Information**
```bash
# Get system-wide information
docker system df

# Output:
# TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
# Images          0         0         0B        0B
# Containers      0         0         0B        0B
# Local Volumes   0         0         0B        0B
# Build Cache     0         0         0B        0B

# Get detailed system info
docker system info
```

### **2. Docker Help**

#### **Getting Help**
```bash
# General help
docker help

# Help for specific command
docker run --help

# Help for subcommand
docker container --help

# Search help
docker help | grep "container"
```

## 🖼️ Image Management Commands

### **1. Working with Images**

#### **List Images**
```bash
# List all images
docker images

# Alternative command
docker image ls

# List images with specific format
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# List images by repository
docker images nginx

# List images with filters
docker images --filter "dangling=true"
docker images --filter "label=environment=production"
```

#### **Pull Images**
```bash
# Pull image from Docker Hub
docker pull nginx

# Pull specific tag
docker pull nginx:1.21

# Pull from specific registry
docker pull myregistry.com/myapp:latest

# Pull with progress bar
docker pull --progress=plain nginx
```

#### **Build Images**
```bash
# Build image from current directory
docker build -t myapp:latest .

# Build with specific Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# Build with build arguments
docker build --build-arg VERSION=1.0 -t myapp:latest .

# Build without cache
docker build --no-cache -t myapp:latest .

# Build with target stage
docker build --target production -t myapp:prod .
```

#### **Image Operations**
```bash
# Tag an image
docker tag myapp:latest myapp:v1.0

# Remove an image
docker rmi myapp:v1.0

# Force remove image (even if used by containers)
docker rmi -f myapp:v1.0

# Remove all unused images
docker image prune

# Remove all images
docker rmi $(docker images -q)
```

### **2. Image Inspection**

#### **Inspect Images**
```bash
# Inspect image details
docker inspect nginx:latest

# Get specific information
docker inspect -f '{{.Config.Env}}' nginx:latest

# Get image history
docker history nginx:latest

# Get image size
docker images --format "{{.Repository}}:{{.Tag}} - {{.Size}}"
```

## 🐳 Container Management Commands

### **1. Container Lifecycle**

#### **Create and Run Containers**
```bash
# Run container (create + start)
docker run nginx:latest

# Run in detached mode
docker run -d nginx:latest

# Run with specific name
docker run --name my-nginx nginx:latest

# Run with port mapping
docker run -p 8080:80 nginx:latest

# Run with environment variables
docker run -e MYSQL_ROOT_PASSWORD=secret mysql:8.0

# Run with volume mounting
docker run -v /host/path:/container/path nginx:latest

# Run with network
docker run --network my-network nginx:latest
```

#### **Container Lifecycle Commands**
```bash
# Create container (doesn't start)
docker create nginx:latest

# Start container
docker start container_name

# Stop container
docker stop container_name

# Restart container
docker restart container_name

# Pause container
docker pause container_name

# Unpause container
docker unpause container_name

# Kill container (force stop)
docker kill container_name

# Remove container
docker rm container_name

# Force remove running container
docker rm -f container_name
```

### **2. Container Information**

#### **List Containers**
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# List containers with specific format
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

# List containers by status
docker ps --filter "status=running"
docker ps --filter "status=exited"

# List containers by label
docker ps --filter "label=environment=production"
```

#### **Container Inspection**
```bash
# Inspect container details
docker inspect container_name

# Get specific information
docker inspect -f '{{.NetworkSettings.IPAddress}}' container_name

# Get container logs
docker logs container_name

# Follow container logs
docker logs -f container_name

# Get last N lines of logs
docker logs --tail 100 container_name

# Get logs with timestamps
docker logs -t container_name
```

### **3. Container Interaction**

#### **Execute Commands in Containers**
```bash
# Execute command in running container
docker exec container_name ls -la

# Interactive shell in container
docker exec -it container_name /bin/bash

# Execute as specific user
docker exec -u root container_name whoami

# Execute in specific working directory
docker exec -w /app container_name pwd
```

#### **Copy Files**
```bash
# Copy file from host to container
docker cp local_file.txt container_name:/app/

# Copy file from container to host
docker cp container_name:/app/logs.txt ./

# Copy directory
docker cp ./src/ container_name:/app/
```

## 🌐 Network Commands

### **1. Network Management**

#### **List Networks**
```bash
# List all networks
docker network ls

# List networks with details
docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"

# Inspect network
docker network inspect bridge
```

#### **Create and Manage Networks**
```bash
# Create custom network
docker network create my-network

# Create network with specific driver
docker network create -d overlay my-overlay

# Create network with subnet
docker network create --subnet=172.18.0.0/16 my-network

# Remove network
docker network rm my-network

# Connect container to network
docker network connect my-network container_name

# Disconnect container from network
docker network disconnect my-network container_name
```

### **2. Network Operations**
```bash# Check network connectivity
docker network inspect bridge

# Get container's network info
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name

# Test network connectivity between containers
docker exec container1 ping container2
```

## 💾 Volume Commands

### **1. Volume Management**

#### **List and Create Volumes**
```bash
# List all volumes
docker volume ls

# Create volume
docker volume create my-volume

# Create volume with specific driver
docker volume create --driver local my-volume

# Inspect volume
docker volume inspect my-volume
```

#### **Volume Operations**
```bash
# Remove volume
docker volume rm my-volume

# Remove all unused volumes
docker volume prune

# Remove all volumes
docker volume rm $(docker volume ls -q)
```

### **2. Volume Usage**
```bash
# Run container with named volume
docker run -v my-volume:/app/data nginx:latest

# Run container with bind mount
docker run -v /host/path:/container/path nginx:latest

# Run container with read-only volume
docker run -v my-volume:/app/data:ro nginx:latest
```

## 🔍 System Maintenance Commands

### **1. Cleanup Commands**

#### **System Cleanup**
```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune

# Remove all unused networks
docker network prune

# Remove all unused volumes
docker volume prune

# Remove all unused Docker objects
docker system prune

# Remove all unused Docker objects (including images)
docker system prune -a
```

#### **Resource Usage**
```bash
# Show container resource usage
docker stats

# Show container resource usage for specific containers
docker stats container1 container2

# Show resource usage without streaming
docker stats --no-stream

# Show resource usage with specific format
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### **2. System Information**
```bash
# Show Docker disk usage
docker system df

# Show detailed disk usage
docker system df -v

# Show Docker events
docker events

# Show Docker events with filters
docker events --filter "type=container" --filter "event=start"
```

## 🚀 Advanced Commands

### **1. Multi-Container Operations**

#### **Docker Compose Commands**
```bash
# Start services
docker-compose up

# Start services in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View service logs
docker-compose logs

# View logs for specific service
docker-compose logs web

# Follow logs
docker-compose logs -f

# Rebuild and start services
docker-compose up --build
```

### **2. Image Operations**

#### **Save and Load Images**
```bash
# Save image to tar file
docker save nginx:latest > nginx.tar

# Save multiple images
docker save nginx:latest mysql:8.0 > images.tar

# Load image from tar file
docker load < nginx.tar

# Export container filesystem
docker export container_name > container.tar

# Import container filesystem
docker import container.tar myapp:latest
```

#### **Image Building**
```bash
# Build with build context from URL
docker build https://github.com/user/repo.git

# Build with build context from tar file
docker build - < context.tar

# Build with build context from stdin
echo -e 'FROM busybox\nRUN echo "hello world"' | docker build -
```

## 📊 Useful Command Combinations

### **1. Container Management Scripts**

#### **Stop All Running Containers**
```bash
# Stop all running containers
docker stop $(docker ps -q)

# Alternative approach
docker ps -q | xargs docker stop
```

#### **Remove All Stopped Containers**
```bash
# Remove all stopped containers
docker container prune -f

# Alternative approach
docker ps -a -q | xargs docker rm
```

#### **Clean Up Everything**
```bash
# Clean up everything (use with caution!)
docker system prune -a -f --volumes
```

### **2. Information Gathering**

#### **Get Container IP Addresses**
```bash
# Get all container IP addresses
docker inspect -f '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -aq)
```

#### **Get Container Resource Usage**
```bash
# Get memory usage for all containers
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

## 🔍 Troubleshooting Commands

### **1. Debugging Containers**

#### **Container Issues**
```bash
# Check container status
docker ps -a

# Check container logs
docker logs container_name

# Check container configuration
docker inspect container_name

# Check container processes
docker top container_name

# Check container changes
docker diff container_name
```

#### **Network Issues**
```bash
# Check network configuration
docker network inspect bridge

# Check container network
docker inspect -f '{{.NetworkSettings.Networks}}' container_name

# Test network connectivity
docker exec container_name ping google.com
```

### **2. System Issues**

#### **Daemon Problems**
```bash
# Check Docker daemon status
sudo systemctl status docker

# Check Docker daemon logs
sudo journalctl -u docker.service

# Restart Docker daemon
sudo systemctl restart docker
```

## 📚 Command Reference Quick Guide

### **Essential Commands Summary**

| Category | Command | Description |
|----------|---------|-------------|
| **Images** | `docker images` | List images |
| **Images** | `docker pull` | Pull image |
| **Images** | `docker build` | Build image |
| **Images** | `docker rmi` | Remove image |
| **Containers** | `docker run` | Run container |
| **Containers** | `docker ps` | List containers |
| **Containers** | `docker start/stop` | Start/stop container |
| **Containers** | `docker exec` | Execute command in container |
| **Containers** | `docker logs` | View container logs |
| **Networks** | `docker network ls` | List networks |
| **Networks** | `docker network create` | Create network |
| **Volumes** | `docker volume ls` | List volumes |
| **Volumes** | `docker volume create` | Create volume |
| **System** | `docker system df` | Show disk usage |
| **System** | `docker system prune` | Clean up system |

## 🎯 Best Practices

### **1. Command Organization**
- **Use descriptive names**: `--name my-web-app` instead of random names
- **Use tags**: Always tag your images with meaningful versions
- **Use labels**: Add metadata to your containers and images
- **Use filters**: Filter output to find specific resources

### **2. Resource Management**
- **Clean up regularly**: Use `docker system prune` to remove unused resources
- **Monitor usage**: Use `docker stats` to monitor container performance
- **Limit resources**: Use `--memory` and `--cpus` flags to limit resource usage

### **3. Security**
- **Don't run as root**: Use `--user` flag to run containers as non-root users
- **Use read-only volumes**: Mount volumes as read-only when possible
- **Scan images**: Regularly scan images for vulnerabilities

## 🚀 Next Steps

Now that you understand basic Docker commands, let's explore:

1. **Advanced Topics** - Multi-stage builds and optimization
2. **Security A-Z** - Complete security guide
3. **Practical Examples** - Hands-on containerization
4. **Docker Compose** - Multi-container orchestration

---

*Mastering these basic Docker commands gives you the foundation to work effectively with containers. Practice these commands regularly to build confidence and discover advanced usage patterns.* 