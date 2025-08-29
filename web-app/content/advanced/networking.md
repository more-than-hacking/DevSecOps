# 🌐 Docker Networking: Container Communication

## 🎯 Understanding Docker Networking

Docker networking allows containers to communicate with each other, the host system, and external networks. Understanding Docker's networking model is crucial for building scalable, secure, and maintainable containerized applications.

## 🏗️ Docker Network Architecture

### **Network Drivers Overview**
```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                Bridge Network                           │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │ Container A │  │ Container B │  │ Container C │    │
│  │  │172.17.0.2   │  │172.17.0.3   │  │172.17.0.4   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Host Network                             │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   eth0      │  │   docker0   │  │   lo        │    │
│  │  │192.168.1.10 │  │172.17.0.1   │  │127.0.0.1    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Network Drivers

### **1. Bridge Driver (Default)**

#### **What is Bridge Networking?**
The bridge driver creates a private internal network on the host. Containers connected to the same bridge network can communicate with each other.

#### **Default Bridge Network**
```bash
# List networks
docker network ls

# Output:
# NETWORK ID     NAME      DRIVER    SCOPE
# 1234567890ab   bridge    bridge    local
# 9876543210cd   host      host      local
# abcdef123456   none      null      local

# Inspect default bridge
docker network inspect bridge
```

#### **Container Communication on Bridge**
```bash
# Run containers on default bridge
docker run -d --name web1 nginx:latest
docker run -d --name web2 nginx:latest

# Check container IPs
docker inspect web1 | grep IPAddress
docker inspect web2 | grep IPAddress

# Test connectivity (by IP only)
docker exec web1 ping 172.17.0.3
```

#### **Custom Bridge Networks**
```bash
# Create custom bridge network
docker network create --driver bridge my-network

# Run containers on custom network
docker run -d --name app1 --network my-network nginx:latest
docker run -d --name app2 --network my-network nginx:latest

# Test connectivity (by name and IP)
docker exec app1 ping app2
docker exec app1 ping app2.my-network
```

#### **Bridge Network Configuration**
```bash
# Create network with custom subnet
docker network create \
  --driver bridge \
  --subnet=172.20.0.0/16 \
  --ip-range=172.20.240.0/20 \
  --gateway=172.20.0.1 \
  custom-bridge

# Create network with custom options
docker network create \
  --driver bridge \
  --opt com.docker.network.bridge.name=custom0 \
  --opt com.docker.network.bridge.enable_ip_masquerade=true \
  --opt com.docker.network.bridge.enable_icc=true \
  custom-bridge-opts
```

### **2. Host Driver**

#### **What is Host Networking?**
With host networking, containers share the host's network stack. No network isolation between container and host.

#### **Host Network Usage**
```bash
# Run container with host networking
docker run -d --network host nginx:latest

# Container uses host's network interfaces directly
# No port mapping needed - container binds to host ports directly
```

#### **Host Network Characteristics**
```bash
# Advantages:
- Better network performance
- No port mapping overhead
- Direct access to host interfaces

# Disadvantages:
- No network isolation
- Port conflicts possible
- Security concerns
- Not portable across hosts
```

### **3. Overlay Driver**

#### **What is Overlay Networking?**
Overlay networks enable communication between containers across multiple Docker hosts. Used primarily in Docker Swarm mode.

#### **Creating Overlay Networks**
```bash
# Initialize Docker Swarm (required for overlay)
docker swarm init

# Create overlay network
docker network create \
  --driver overlay \
  --attachable \
  multi-host-network

# Deploy service on overlay network
docker service create \
  --name web \
  --network multi-host-network \
  --replicas 3 \
  nginx:latest
```

#### **Overlay Network Features**
```bash
# Features:
- Multi-host communication
- Automatic service discovery
- Load balancing
- Encryption support
- Fault tolerance
```

### **4. Macvlan Driver**

#### **What is Macvlan Networking?**
Macvlan allows containers to have their own MAC addresses and appear as physical devices on the network.

#### **Macvlan Configuration**
```bash
# Create macvlan network
docker network create -d macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 \
  macvlan-net

# Run container with macvlan
docker run -d \
  --network macvlan-net \
  --ip=192.168.1.100 \
  --name web-macvlan \
  nginx:latest
```

### **5. None Driver**

#### **What is None Networking?**
Containers with none networking have no network access. Useful for completely isolated containers.

#### **None Network Usage**
```bash
# Run container with no networking
docker run -d --network none --name isolated nginx:latest

# Container has only loopback interface
docker exec isolated ip addr show
```

## 🔌 Container Communication Patterns

### **1. Container-to-Container Communication**

#### **Same Network Communication**
```bash
# Create custom network
docker network create app-network

# Run containers on same network
docker run -d --name database --network app-network postgres:13
docker run -d --name web --network app-network nginx:latest
docker run -d --name cache --network app-network redis:6-alpine

# Containers can communicate by name
docker exec web ping database
docker exec web ping cache
```

#### **Multi-Network Communication**
```bash
# Create multiple networks
docker network create frontend
docker network create backend

# Connect container to multiple networks
docker run -d --name app nginx:latest
docker network connect frontend app
docker network connect backend app

# Container can communicate on both networks
docker network inspect frontend
docker network inspect backend
```

### **2. Service Discovery**

#### **DNS-Based Service Discovery**
```bash
# Containers on custom networks get automatic DNS resolution
docker network create myapp

docker run -d --name db --network myapp postgres:13
docker run -d --name web --network myapp nginx:latest

# Web container can reach database by name
docker exec web nslookup db
docker exec web ping db.myapp
```

#### **Service Discovery with Docker Compose**
```yaml
version: '3.8'

services:
  database:
    image: postgres:13
    networks:
      - backend
  
  web:
    image: nginx:latest
    networks:
      - frontend
      - backend
    # Can reach database as 'database'
  
  proxy:
    image: nginx:latest
    networks:
      - frontend
    # Can reach web as 'web'

networks:
  frontend:
  backend:
```

### **3. External Communication**

#### **Port Publishing**
```bash
# Publish container port to host
docker run -d -p 8080:80 --name web nginx:latest

# Publish to specific host interface
docker run -d -p 127.0.0.1:8080:80 --name web nginx:latest

# Publish random host port
docker run -d -P --name web nginx:latest

# Check published ports
docker port web
```

#### **Host Access from Container**
```bash
# Access host services from container
docker run -d --add-host host.docker.internal:host-gateway nginx:latest

# On Linux, use host networking for direct access
docker run -d --network host nginx:latest
```

## 🔒 Network Security

### **1. Network Isolation**

#### **Isolating Container Groups**
```bash
# Create isolated networks
docker network create --internal backend-only
docker network create frontend

# Backend containers (no external access)
docker run -d --name db --network backend-only postgres:13

# Frontend containers (external access)
docker run -d --name web -p 80:80 --network frontend nginx:latest

# Connect web to backend for database access
docker network connect backend-only web
```

#### **Firewall Rules**
```bash
# Docker automatically creates iptables rules
# View Docker-related iptables rules
sudo iptables -L DOCKER
sudo iptables -L DOCKER-USER

# Custom iptables rules for Docker
sudo iptables -I DOCKER-USER -s 172.17.0.0/16 -d 192.168.1.0/24 -j DROP
```

### **2. Network Encryption**

#### **Overlay Network Encryption**
```bash
# Create encrypted overlay network
docker network create \
  --driver overlay \
  --opt encrypted \
  encrypted-network

# All traffic on this network is automatically encrypted
```

#### **TLS Termination**
```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "443:443"
    networks:
      - frontend

  app:
    image: myapp:latest
    networks:
      - frontend
      - backend
    # Internal communication over HTTP

networks:
  frontend:
  backend:
    internal: true
```

## 🔧 Advanced Networking Configurations

### **1. Custom Network Configurations**

#### **Network with Custom DNS**
```bash
# Create network with custom DNS
docker network create \
  --driver bridge \
  --opt com.docker.network.bridge.name=custom0 \
  --dns 8.8.8.8 \
  --dns 8.8.4.4 \
  custom-dns-network
```

#### **Network with IP Address Management**
```bash
# Create network with IPAM configuration
docker network create \
  --driver bridge \
  --subnet=10.0.0.0/16 \
  --ip-range=10.0.1.0/24 \
  --gateway=10.0.0.1 \
  --aux-address="host1=10.0.0.5" \
  --aux-address="host2=10.0.0.6" \
  ipam-network
```

### **2. Load Balancing**

#### **Docker Swarm Load Balancing**
```bash
# Create service with load balancing
docker service create \
  --name web \
  --replicas 3 \
  --publish 80:80 \
  nginx:latest

# Requests to port 80 are load-balanced across replicas
```

#### **External Load Balancer Integration**
```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    deploy:
      replicas: 3
    networks:
      - webnet

  lb:
    image: haproxy:latest
    ports:
      - "80:80"
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    networks:
      - webnet

networks:
  webnet:
```

### **3. Network Monitoring**

#### **Network Inspection Commands**
```bash
# List all networks
docker network ls

# Inspect network details
docker network inspect bridge

# Show network usage
docker network inspect bridge --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{end}}'

# Monitor network traffic
docker exec container_name netstat -i
docker exec container_name ss -tuln
```

#### **Network Debugging**
```bash
# Test connectivity
docker exec container1 ping container2
docker exec container1 telnet container2 80
docker exec container1 nslookup container2

# Check routing
docker exec container1 ip route
docker exec container1 traceroute container2

# Monitor network interfaces
docker exec container1 ip addr show
docker exec container1 netstat -rn
```

## 🔄 Network Management Best Practices

### **1. Network Design Principles**

#### **Segmentation Strategy**
```bash
# Separate networks by function
docker network create frontend    # Web servers, load balancers
docker network create backend     # Application servers
docker network create database    # Database servers
docker network create monitoring  # Monitoring tools

# Connect containers to appropriate networks
docker run -d --name web --network frontend nginx:latest
docker run -d --name app --network backend myapp:latest
docker run -d --name db --network database postgres:13

# Connect multi-tier applications
docker network connect backend web  # Web can reach app
docker network connect database app # App can reach db
```

#### **Security Zones**
```bash
# Create security zones with different access levels
docker network create --internal secure-backend
docker network create dmz
docker network create public

# Place containers in appropriate zones
docker run -d --name db --network secure-backend postgres:13
docker run -d --name api --network dmz myapi:latest
docker run -d --name web -p 80:80 --network public nginx:latest

# Connect across zones as needed
docker network connect secure-backend api
docker network connect dmz web
```

### **2. Performance Optimization**

#### **Network Performance Tips**
```bash
# Use host networking for maximum performance
docker run -d --network host high-performance-app

# Use custom bridge networks for better isolation
docker network create --driver bridge optimized-network

# Optimize bridge network settings
docker network create \
  --driver bridge \
  --opt com.docker.network.driver.mtu=1500 \
  --opt com.docker.network.bridge.enable_ip_masquerade=false \
  optimized-bridge
```

#### **Bandwidth and QoS**
```bash
# Limit container bandwidth (using tc - traffic control)
docker run -d --name limited-app \
  --cap-add NET_ADMIN \
  nginx:latest

# Inside container or on host
tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms
```

### **3. Troubleshooting Network Issues**

#### **Common Network Problems**
```bash
# Container can't reach other containers
# Check network membership
docker inspect container_name | grep NetworkMode
docker network inspect network_name

# Port binding issues
# Check port conflicts
netstat -tulpn | grep :80
docker ps --format "table {{.Names}}\t{{.Ports}}"

# DNS resolution problems
# Test DNS from container
docker exec container_name nslookup google.com
docker exec container_name cat /etc/resolv.conf
```

#### **Network Diagnostic Tools**
```bash
# Install network tools in container
docker exec container_name apt-get update
docker exec container_name apt-get install -y net-tools iputils-ping dnsutils

# Test connectivity
docker exec container_name ping -c 3 8.8.8.8
docker exec container_name curl -I http://google.com
docker exec container_name nc -zv container2 80
```

## 🎯 Real-World Networking Scenarios

### **1. Microservices Architecture**
```yaml
version: '3.8'

services:
  # API Gateway
  gateway:
    image: nginx:latest
    ports:
      - "80:80"
    networks:
      - frontend
      - api

  # User Service
  user-service:
    image: user-service:latest
    networks:
      - api
      - user-db-net

  # Order Service
  order-service:
    image: order-service:latest
    networks:
      - api
      - order-db-net

  # Databases
  user-db:
    image: postgres:13
    networks:
      - user-db-net

  order-db:
    image: postgres:13
    networks:
      - order-db-net

networks:
  frontend:      # External access
  api:           # Inter-service communication
  user-db-net:   # User service database
    internal: true
  order-db-net:  # Order service database
    internal: true
```

### **2. Development Environment**
```yaml
version: '3.8'

services:
  # Development proxy
  proxy:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx-dev.conf:/etc/nginx/nginx.conf:ro
    networks:
      - dev-network

  # Application with hot reload
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - dev-network
    environment:
      - NODE_ENV=development

  # Development database
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp_dev
    ports:
      - "5432:5432"  # Expose for external tools
    networks:
      - dev-network

networks:
  dev-network:
    driver: bridge
```

## 🚀 Next Steps

Now that you understand Docker networking, let's explore:

1. **Volumes & Storage** - Data persistence strategies
2. **Image Optimization** - Performance techniques
3. **Security A-Z** - Complete security guide
4. **Practical Examples** - Hands-on containerization

---

*Docker networking is the foundation for building scalable, secure containerized applications. Understanding these concepts enables you to design robust multi-container architectures.*