# 🛡️ Security Fundamentals: Container Security Basics

## 🎯 Understanding Container Security

Container security is a critical aspect of modern application deployment. While containers provide isolation, they also introduce unique security challenges that must be addressed to protect your applications, data, and infrastructure.

## 🔍 Why Container Security Matters

### **The Security Challenge**
```bash
# Traditional security model:
- Applications run in isolated environments
- Network boundaries are well-defined
- Access control is centralized
- Security tools are mature

# Container security challenges:
- Shared kernel with host
- Ephemeral nature of containers
- Complex networking and storage
- Rapid deployment cycles
- Multiple attack vectors
```

### **Real-World Security Incidents**
```bash
# Examples of container security breaches:
- Cryptojacking attacks via compromised images
- Data exfiltration through exposed ports
- Privilege escalation attacks
- Supply chain attacks via malicious base images
- Runtime attacks exploiting vulnerabilities
```

## 🏗️ Container Security Architecture

### **Security Layers**
```
┌─────────────────────────────────────────────────────────────┐
│                    Container Security Stack                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                Application Security                     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Code      │  │   Dependencies│  │   Config   │    │
│  │  │  Review     │  │   Scanning  │  │   Security  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Container Security                       │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Image     │  │   Runtime   │  │   Network   │    │
│  │  │  Security   │  │   Security  │  │   Security  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Host Security                            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Kernel    │  │   System    │  │   Network   │    │
│  │  │  Security   │  │   Hardening │  │   Security  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

### **Security Principles**

#### **Defense in Depth**
```bash
# Multiple security layers:
1. Host security (kernel, system hardening)
2. Container runtime security (namespaces, cgroups)
3. Application security (code, dependencies)
4. Network security (firewalls, segmentation)
5. Monitoring and detection (logging, alerts)
```

#### **Principle of Least Privilege**
```bash
# Containers should have:
- Minimum required permissions
- Limited access to host resources
- Restricted network access
- Minimal user privileges
- No unnecessary capabilities
```

#### **Zero Trust Model**
```bash
# Security assumptions:
- Never trust, always verify
- Verify every request
- Assume breach, design for detection
- Continuous monitoring and validation
```

## 🔒 Container Isolation Mechanisms

### **1. Namespaces**

#### **What are Namespaces?**
Namespaces provide isolation between containers by creating separate views of system resources.

#### **Namespace Types and Security**
```bash
# PID Namespace
- Isolates process IDs
- Container can't see host processes
- Prevents process enumeration attacks

# Network Namespace  
- Isolates network interfaces
- Container has its own network stack
- Prevents network sniffing attacks

# Mount Namespace
- Isolates filesystem mounts
- Container can't see host files
- Prevents filesystem access attacks

# UTS Namespace
- Isolates hostname and domain
- Container can't change host hostname
- Prevents host identification attacks

# IPC Namespace
- Isolates inter-process communication
- Container can't communicate with host processes
- Prevents IPC-based attacks

# User Namespace
- Isolates user and group IDs
- Container can run as root without host root access
- Prevents privilege escalation attacks
```

#### **Namespace Security Benefits**
```bash
# Attack surface reduction:
- Process isolation prevents host enumeration
- Network isolation prevents traffic interception
- Filesystem isolation prevents data access
- User isolation prevents privilege escalation
```

### **2. Control Groups (cgroups)**

#### **What are cgroups?**
cgroups limit and measure resource usage of containers, providing resource isolation and preventing resource exhaustion attacks.

#### **cgroup Security Features**
```bash
# Resource limits:
- CPU limits prevent CPU exhaustion attacks
- Memory limits prevent memory-based attacks
- I/O limits prevent disk abuse
- Network limits prevent bandwidth attacks

# Security benefits:
- Prevents resource starvation
- Limits attack impact
- Enables resource monitoring
- Supports security policies
```

#### **cgroup Implementation**
```bash
# cgroup v2 structure
/sys/fs/cgroup/
├── docker/
│   └── container_id/
│       ├── cpu.max          # CPU limits
│       ├── memory.max       # Memory limits
│       ├── io.max           # I/O limits
│       └── pids.max         # Process limits

# Setting security limits
echo "500000" > /sys/fs/cgroup/docker/container_id/cpu.max
echo "1G" > /sys/fs/cgroup/docker/container_id/memory.max
echo "1000" > /sys/fs/cgroup/docker/container_id/pids.max
```

### **3. Capabilities**

#### **What are Capabilities?**
Linux capabilities provide fine-grained control over what privileged operations a process can perform.

#### **Docker Capability Management**
```bash
# Docker drops capabilities by default:
- No root access to host
- Limited system calls
- Restricted device access
- Controlled network access

# View container capabilities
docker inspect container_name | grep -A 10 "Capabilities"

# Run with specific capabilities
docker run --cap-add SYS_ADMIN --cap-drop NET_ADMIN myapp

# Run with no capabilities
docker run --cap-drop ALL myapp
```

#### **Common Capabilities and Risks**
```bash
# Dangerous capabilities:
SYS_ADMIN     # System administration (very dangerous)
SYS_MODULE    # Load kernel modules
SYS_RAWIO     # Direct I/O access
SYS_PTRACE    # Process debugging
NET_ADMIN     # Network administration
SYS_CHROOT    # Change root directory

# Safer capabilities:
CHOWN         # Change file ownership
SETGID        # Set group ID
SETUID        # Set user ID
KILL          # Send signals
NET_BIND_SERVICE  # Bind to privileged ports
```

## 🚫 Security Restrictions

### **1. Read-Only Root Filesystem**

#### **Benefits of Read-Only Filesystem**
```bash
# Security advantages:
- Prevents file modification attacks
- Stops malware persistence
- Prevents configuration tampering
- Reduces attack surface

# Implementation
docker run --read-only myapp

# With temporary writable directories
docker run --read-only --tmpfs /tmp --tmpfs /var/log myapp
```

#### **Read-Only Configuration**
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: myapp:latest
    read_only: true
    tmpfs:
      - /tmp
      - /var/log
      - /var/cache
```

### **2. Non-Root Users**

#### **Running as Non-Root**
```bash
# Security benefits:
- Limits attack impact
- Prevents privilege escalation
- Reduces host access
- Follows security best practices

# Implementation
docker run --user 1000:1000 myapp

# In Dockerfile
RUN adduser -D -s /bin/sh appuser
USER appuser
```

#### **User Namespace Mapping**
```bash
# Map container users to host users
docker run --userns=host myapp

# Use specific user namespace
docker run --userns=host:1000:1000 myapp
```

### **3. Security Profiles**

#### **AppArmor Profiles**
```bash
# AppArmor provides mandatory access control
# Docker includes default AppArmor profiles

# View AppArmor status
docker inspect container_name | grep -A 5 "AppArmorProfile"

# Run with custom profile
docker run --security-opt apparmor=my-profile myapp

# Run without AppArmor (not recommended)
docker run --security-opt apparmor=unconfined myapp
```

#### **SELinux Profiles**
```bash
# SELinux provides mandatory access control
# Common on RHEL/CentOS systems

# View SELinux status
docker inspect container_name | grep -A 5 "SELinuxOptions"

# Run with SELinux labels
docker run --security-opt label=type:container_runtime_t myapp
```

## 🌐 Network Security

### **1. Network Isolation**

#### **Network Segmentation**
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

#### **Port Exposure Control**
```bash
# Only expose necessary ports
docker run -d --name app -p 8080:8080 myapp:latest

# Use specific host binding
docker run -d --name app -p 127.0.0.1:8080:8080 myapp:latest

# Expose to internal network only
docker run -d --name app --expose 8080 myapp:latest
```

### **2. Network Policies**

#### **Firewall Rules**
```bash
# Docker automatically creates iptables rules
# View Docker-related rules
sudo iptables -L DOCKER
sudo iptables -L DOCKER-USER

# Custom firewall rules
sudo iptables -I DOCKER-USER -s 172.17.0.0/16 -d 192.168.1.0/24 -j DROP
```

## 🔍 Security Monitoring

### **1. Container Monitoring**

#### **Runtime Monitoring**
```bash
# Monitor container processes
docker top container_name

# Check container logs
docker logs container_name

# Monitor resource usage
docker stats container_name

# Inspect container configuration
docker inspect container_name
```

#### **Security Events**
```bash
# Monitor Docker daemon logs
sudo journalctl -u docker.service -f

# Monitor system calls
docker run --security-opt seccomp=unconfined myapp

# Monitor file access
docker run --security-opt apparmor=audit myapp
```

### **2. Security Scanning**

#### **Vulnerability Scanning**
```bash
# Scan images for vulnerabilities
trivy image myapp:latest

# Scan running containers
trivy container container_name

# Scan filesystem
trivy fs /path/to/scan
```

#### **Runtime Security Monitoring**
```bash
# Monitor for suspicious activities
- Unusual process creation
- Network connections to known bad IPs
- File system modifications
- Privilege escalation attempts
- Resource usage anomalies
```

## 📋 Security Checklist

### **Container Security Checklist**
```bash
# Image Security:
□ Use minimal base images
□ Scan images for vulnerabilities
□ Sign and verify images
□ Use multi-stage builds
□ Remove unnecessary packages

# Runtime Security:
□ Run as non-root user
□ Use read-only filesystem
□ Drop unnecessary capabilities
□ Apply security profiles
□ Limit resource usage

# Network Security:
□ Use network segmentation
□ Expose minimal ports
□ Apply firewall rules
□ Monitor network traffic
□ Use encrypted communication

# Host Security:
□ Keep Docker updated
□ Secure Docker daemon
□ Monitor host resources
□ Apply host hardening
□ Regular security audits
```

## 🚨 Common Security Mistakes

### **1. Running as Root**
```bash
# Bad - running as root
FROM ubuntu:20.04
USER root
CMD ["/bin/bash"]

# Good - running as non-root
FROM ubuntu:20.04
RUN useradd -r -s /bin/false appuser
USER appuser
CMD ["/bin/bash"]
```

### **2. Exposing Unnecessary Ports**
```bash
# Bad - exposing all ports
docker run -d --name app -P myapp:latest

# Good - exposing only needed ports
docker run -d --name app -p 8080:8080 myapp:latest
```

### **3. Using Latest Tags**
```bash
# Bad - using latest tag
FROM node:latest

# Good - using specific version
FROM node:16-alpine
```

### **4. Ignoring Security Updates**
```bash
# Bad - not updating base images
FROM ubuntu:20.04

# Good - regular updates
FROM ubuntu:20.04
RUN apt-get update && apt-get upgrade -y
```

## 🔧 Security Tools

### **1. Built-in Docker Security**
```bash
# Docker security features:
- Content trust (DCT)
- Secrets management
- Security scanning
- Runtime security
- Network security
```

### **2. Third-Party Security Tools**
```bash
# Vulnerability scanning:
- Trivy
- Clair
- Anchore
- Snyk

# Runtime protection:
- Falco
- Aqua Security
- Sysdig Secure
- Twistlock

# Compliance:
- OpenSCAP
- InSpec
- Compliance as Code
```

## 🎯 Security Best Practices

### **1. Development Workflow**
- **Security scanning** in CI/CD pipeline
- **Code review** for security issues
- **Dependency scanning** for vulnerabilities
- **Image signing** and verification

### **2. Production Deployment**
- **Regular security updates** of base images
- **Runtime monitoring** for security events
- **Network segmentation** and isolation
- **Access control** and authentication

### **3. Continuous Monitoring**
- **Security event logging** and alerting
- **Regular vulnerability assessments**
- **Compliance monitoring** and reporting
- **Incident response** planning and testing

## 🚀 Next Steps

Now that you understand security fundamentals, let's explore:

1. **Vulnerability Scanning** - Finding and fixing security issues
2. **Runtime Security** - Protecting running containers
3. **Best Practices** - Proven security strategies
4. **Compliance** - Meeting regulatory requirements

---

*Container security is fundamental to protecting your applications and infrastructure. Understanding these basics enables you to build secure, resilient containerized applications.* 