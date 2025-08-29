# 🏗️ Docker Architecture: How Docker Works Under the Hood

## 🎯 Understanding Docker's Internal Architecture

Docker's architecture is what makes it so powerful and efficient. Understanding how Docker works internally helps you make better decisions about containerization, troubleshooting, and optimization. Let's dive deep into Docker's architecture components.

## 🏗️ High-Level Docker Architecture

### **Docker Client-Server Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Client                            │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │   Docker CLI    │    │   Docker API    │               │
│  │   (Command     │    │   (HTTP/REST)   │               │
│  │    Line)       │    │                 │               │
│  └─────────────────┘    └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                Docker Daemon                            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Images    │  │ Containers │  │  Networks   │    │
│  │  │  Manager    │  │  Manager   │  │  Manager   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Container Runtime                        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │  containerd │  │   runc      │  │  Namespaces │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Host Operating System                     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Kernel    │  │   Drivers   │  │   Services  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Hardware (CPU, RAM, Storage, Network)    │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Docker Components Deep Dive

### **1. Docker Client**

#### **What is the Docker Client?**
The Docker client is the primary way users interact with Docker. It can be:
- **Docker CLI**: Command-line interface
- **Docker Desktop**: GUI application
- **Third-party tools**: IDEs, CI/CD systems

#### **Client Responsibilities**
```bash
# Client handles:
- Command parsing and validation
- API request formatting
- Response processing
- Error handling and display
- User interaction
```

#### **Client Communication**
```bash
# Client communicates with daemon via:
- Unix socket (Linux/macOS): /var/run/docker.sock
- Named pipe (Windows): //./pipe/docker_engine
- TCP/HTTP (remote daemon): tcp://host:port
```

### **2. Docker Daemon**

#### **What is the Docker Daemon?**
The Docker daemon (`dockerd`) is a background service that manages Docker objects and handles Docker API requests.

#### **Daemon Responsibilities**
```bash
# Daemon manages:
- Images (build, pull, push, remove)
- Containers (create, start, stop, delete)
- Networks (create, configure, remove)
- Volumes (create, mount, unmount)
- Plugins (install, enable, disable)
```

#### **Daemon Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Daemon                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                API Server                               │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   HTTP      │  │   gRPC      │  │   Events    │    │
│  │  │   Server    │  │   Server    │  │   Stream    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Core Services                            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Images    │  │ Containers │  │  Networks   │    │
│  │  │  Manager    │  │  Manager   │  │  Manager   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Storage Drivers                          │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │  OverlayFS  │  │  AUFS       │  │ DeviceMapper│    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Container Runtime                        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │  containerd │  │   runc      │  │  Plugins    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### **3. Container Runtime**

#### **What is the Container Runtime?**
The container runtime is responsible for the low-level operations of creating and running containers.

#### **Runtime Components**

##### **containerd**
```bash
# containerd responsibilities:
- Container lifecycle management
- Image distribution
- Storage management
- Network management
- Metrics collection
```

##### **runc**
```bash
# runc responsibilities:
- Container creation and execution
- Namespace management
- cgroup configuration
- Process isolation
- Security enforcement
```

#### **Runtime Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Container Runtime                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                containerd                               │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Images    │  │ Containers │  │  Snapshots  │    │
│  │  │  Service    │  │  Service   │  │  Service   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                runc                                     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │  Namespace  │  │   cgroups   │  │   Process   │    │
│  │  │  Creation   │  │  Creation   │  │  Execution  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

## 🐧 Linux Kernel Features

### **1. Namespaces**

#### **What are Namespaces?**
Namespaces provide isolation between containers by creating separate views of system resources.

#### **Namespace Types**
```bash
# PID Namespace
- Isolates process IDs
- Each container sees its own process tree
- Container can't see host processes

# Network Namespace
- Isolates network interfaces
- Each container has its own network stack
- Container can't see host network

# Mount Namespace
- Isolates filesystem mounts
- Each container has its own root filesystem
- Container can't see host files

# UTS Namespace
- Isolates hostname and domain name
- Each container can have its own hostname
- Container can't change host hostname

# IPC Namespace
- Isolates inter-process communication
- Each container has its own IPC resources
- Container can't communicate with host processes

# User Namespace
- Isolates user and group IDs
- Container can run as root without host root access
- Enhanced security isolation
```

#### **Namespace Implementation**
```bash
# Creating namespaces manually
unshare --pid --net --mount --uts --ipc --user /bin/bash

# Docker creates namespaces automatically
docker run -it ubuntu:latest /bin/bash
```

### **2. Control Groups (cgroups)**

#### **What are cgroups?**
cgroups limit and measure resource usage of containers.

#### **Resource Types**
```bash
# CPU cgroups
- Limit CPU usage
- Set CPU shares
- Bind to specific CPU cores

# Memory cgroups
- Limit memory usage
- Set memory reservations
- Configure memory swapping

# I/O cgroups
- Limit disk I/O
- Set I/O priorities
- Control bandwidth usage

# Network cgroups
- Limit network bandwidth
- Set network priorities
- Control network access
```

#### **cgroup Implementation**
```bash
# cgroup v2 structure
/sys/fs/cgroup/
├── docker/
│   └── container_id/
│       ├── cpu.max
│       ├── memory.max
│       └── io.max

# Setting limits
echo "500000" > /sys/fs/cgroup/docker/container_id/cpu.max
echo "1G" > /sys/fs/cgroup/docker/container_id/memory.max
```

### **3. Union Filesystem**

#### **What is Union Filesystem?**
Union filesystem allows multiple filesystems to be mounted at the same time, with upper layers hiding lower layers.

#### **Union Filesystem Types**
```bash
# OverlayFS (default on modern systems)
- Fast and efficient
- Good performance
- Native Linux support

# AUFS (deprecated)
- Older implementation
- Less efficient
- Limited kernel support

# DeviceMapper
- Block-level storage
- Good for production
- More complex configuration
```

#### **How Union Filesystem Works**
```
┌─────────────────────────────────────────────────────────────┐
│                    Container View                           │
├─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┤
│  │                Writable Layer (Container)               │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   /tmp      │  │   /logs     │  │   /data     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Image Layers (Read-only)                │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   /app      │  │   /usr      │  │   /bin      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

## 🌐 Docker Networking Architecture

### **Network Drivers**

#### **Bridge Network (Default)**
```bash
# Bridge network characteristics:
- Default network for containers
- Host acts as router
- Containers can communicate with each other
- Port mapping required for external access

# Bridge network setup
docker network create my-bridge
docker run --network my-bridge nginx
```

#### **Host Network**
```bash
# Host network characteristics:
- Container shares host network
- No port mapping needed
- Direct access to host interfaces
- Less isolation

# Host network usage
docker run --network host nginx
```

#### **Overlay Network**
```bash
# Overlay network characteristics:
- Multi-host communication
- Used in Docker Swarm
- Encrypted communication
- Service discovery

# Overlay network creation
docker network create -d overlay my-overlay
```

### **Network Implementation**
```
┌─────────────────────────────────────────────────────────────┐
│                    Host Network Stack                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                Docker Bridge                            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │ Container 1 │  │ Container 2 │  │ Container 3 │    │
│  │  │ 172.17.0.2  │  │ 172.17.0.3  │  │ 172.17.0.4  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Host Interface (eth0)                    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   IP:       │  │   Gateway:  │  │   DNS:      │    │
│  │  │ 192.168.1.5 │  │ 192.168.1.1 │  │ 8.8.8.8    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

## 💾 Docker Storage Architecture

### **Storage Drivers**

#### **Storage Driver Types**
```bash
# OverlayFS (recommended)
- Fast and efficient
- Good performance
- Native Linux support
- Copy-on-write

# DeviceMapper
- Block-level storage
- Good for production
- More complex configuration
- Better performance for some workloads

# AUFS (deprecated)
- Older implementation
- Less efficient
- Limited kernel support
```

#### **Storage Driver Implementation**
```
┌─────────────────────────────────────────────────────────────┐
│                    Storage Driver                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                Container Writable Layer                 │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   /tmp      │  │   /logs     │  │   /data     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Image Layers (Read-only)                │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   /app      │  │   /usr      │  │   /bin      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Host Filesystem                          │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   /var/lib/ │  │   /var/lib/ │  │   /var/lib/ │    │
│  │  │   docker/   │  │   docker/   │  │   docker/   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Security Architecture

### **Security Features**

#### **Process Isolation**
```bash
# Namespace isolation:
- PID namespace: Process isolation
- Network namespace: Network isolation
- Mount namespace: Filesystem isolation
- UTS namespace: Hostname isolation
- IPC namespace: Inter-process communication isolation
- User namespace: User ID isolation
```

#### **Resource Limits**
```bash
# cgroup limits:
- CPU limits prevent resource exhaustion
- Memory limits prevent memory attacks
- I/O limits prevent disk abuse
- Network limits prevent bandwidth abuse
```

#### **Capability Dropping**
```bash
# Docker drops capabilities by default:
- No root access to host
- Limited system calls
- Restricted device access
- Controlled network access
```

### **Security Implementation**
```
┌─────────────────────────────────────────────────────────────┐
│                    Container Security                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                Security Profiles                        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   AppArmor  │  │   SELinux   │  │  Seccomp    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Runtime Security                         │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │ Namespaces  │  │  cgroups    │  │ Capabilities│    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Docker API Architecture

### **API Endpoints**

#### **REST API**
```bash
# HTTP endpoints:
GET    /containers/json          # List containers
POST   /containers/create        # Create container
GET    /containers/{id}/json     # Inspect container
POST   /containers/{id}/start    # Start container
POST   /containers/{id}/stop     # Stop container
DELETE /containers/{id}          # Remove container
```

#### **gRPC API**
```bash
# gRPC services:
- ContainerService: Container operations
- ImageService: Image operations
- NetworkService: Network operations
- VolumeService: Volume operations
```

### **API Implementation**
```
┌─────────────────────────────────────────────────────────────┐
│                    Docker API                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                HTTP Server                              │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   REST      │  │   Events    │  │   WebSocket │    │
│  │  │   API       │  │   Stream    │  │   Support   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                gRPC Server                              │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │ Container   │  │   Image     │  │  Network    │    │
│  │  │ Service     │  │  Service    │  │  Service    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Performance Architecture

### **Performance Optimizations**

#### **Layer Caching**
```bash
# Docker caches layers:
- Unchanged layers are reused
- Faster subsequent builds
- Efficient storage usage
- Reduced network transfer
```

#### **Resource Sharing**
```bash
# Containers share:
- Host kernel
- Base image layers
- System libraries
- Network stack
```

#### **I/O Optimization**
```bash
# I/O optimizations:
- Copy-on-write filesystem
- Efficient layer management
- Optimized storage drivers
- Network performance tuning
```

## 🔍 Troubleshooting Architecture

### **Common Issues and Solutions**

#### **1. Daemon Not Responding**
```bash
# Check daemon status
sudo systemctl status docker

# Check daemon logs
sudo journalctl -u docker.service

# Restart daemon
sudo systemctl restart docker
```

#### **2. Container Startup Issues**
```bash
# Check container logs
docker logs container_name

# Check container status
docker ps -a

# Inspect container
docker inspect container_name
```

#### **3. Performance Issues**
```bash
# Check resource usage
docker stats

# Check storage usage
docker system df

# Check network performance
docker network ls
```

## 📈 Monitoring and Observability

### **Monitoring Tools**

#### **Built-in Monitoring**
```bash
# Docker stats
docker stats

# Docker system info
docker system df

# Docker events
docker events
```

#### **External Monitoring**
```bash
# Prometheus metrics
- Container metrics
- Image metrics
- Network metrics
- Storage metrics

# Log aggregation
- Fluentd
- Logstash
- ELK stack
```

## 🎯 Next Steps

Now that you understand Docker architecture, let's explore:

1. **Basic Commands** - Essential Docker operations
2. **Advanced Topics** - Multi-stage builds and optimization
3. **Security A-Z** - Complete security guide
4. **Practical Examples** - Hands-on containerization

---

*Understanding Docker's architecture gives you insight into how containers work internally. This knowledge helps you make better decisions about containerization, troubleshoot issues effectively, and optimize your Docker deployments.* 