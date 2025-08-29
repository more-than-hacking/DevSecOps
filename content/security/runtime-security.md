# 🛡️ Runtime Security: Protecting Running Containers

## 🎯 Understanding Runtime Security

Runtime security focuses on protecting containers while they are running. This includes monitoring for malicious activities, preventing privilege escalation, detecting anomalies, and responding to security incidents in real-time.

## 🔍 Why Runtime Security Matters

### **The Runtime Threat Landscape**
```bash
# Common runtime attacks:
- Process injection and manipulation
- Privilege escalation attempts
- Network-based attacks
- File system tampering
- Resource exhaustion attacks
- Side-channel attacks

# Attack vectors:
- Exploiting container escape vulnerabilities
- Abusing excessive permissions
- Network reconnaissance and attacks
- Malicious process execution
- Data exfiltration attempts
```

### **Runtime Security Challenges**
```bash
# Container-specific challenges:
- Shared kernel with host
- Ephemeral nature of containers
- Complex networking and storage
- Rapid deployment cycles
- Limited visibility into container internals
- Resource constraints for security tools
```

## 🏗️ Runtime Security Architecture

### **Security Layers at Runtime**
```
┌─────────────────────────────────────────────────────────────┐
│                    Runtime Security Stack                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                Application Layer                        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Process   │  │   Network   │  │   File      │    │
│  │  │  Monitoring │  │   Monitoring│  │   Monitoring│    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Container Runtime                        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Seccomp   │  │   AppArmor  │  │   Capabilities│   │
│  │  │   Profiles  │  │   Profiles  │  │   Management │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Host Security                            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Kernel    │  │   System    │  │   Network   │    │
│  │  │   Security  │  │   Monitoring│  │   Security  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Process Security

### **1. Process Monitoring**

#### **Container Process Visibility**
```bash
# View container processes
docker top container_name

# Monitor process creation
docker exec container_name ps aux

# Check process tree
docker exec container_name pstree

# Monitor for new processes
watch -n 1 'docker exec container_name ps aux'
```

#### **Process Anomaly Detection**
```bash
# Detect unexpected processes
docker exec container_name ps aux | grep -v -E "(PID|ps|grep)"

# Monitor process count
docker exec container_name ps aux | wc -l

# Check for suspicious process names
docker exec container_name ps aux | grep -E "(nc|netcat|bash|sh|python|perl)"
```

### **2. Process Isolation**

#### **Namespace Isolation**
```bash
# Verify PID namespace isolation
docker exec container_name ps aux
# Should not show host processes

# Check namespace configuration
docker inspect container_name | grep -A 10 "Namespaces"

# Verify user namespace isolation
docker exec container_name id
# Should show container user, not host user
```

#### **Process Resource Limits**
```bash
# Set process limits
docker run -d --name limited-app \
  --pids-limit 100 \
  myapp:latest

# Check current limits
docker exec limited-app cat /sys/fs/cgroup/pids.max

# Monitor process count
docker exec limited-app ps aux | wc -l
```

## 🌐 Network Security

### **1. Network Monitoring**

#### **Container Network Activity**
```bash
# Monitor network connections
docker exec container_name netstat -tuln

# Check active connections
docker exec container_name ss -tuln

# Monitor network interfaces
docker exec container_name ip addr show

# Check routing table
docker exec container_name ip route show
```

#### **Network Anomaly Detection**
```bash
# Detect unexpected connections
docker exec container_name netstat -tuln | grep -E ":(80|443|22|3306|5432)"

# Monitor outbound connections
docker exec container_name netstat -tuln | grep ESTABLISHED

# Check for suspicious network activity
docker exec container_name netstat -tuln | grep -E "(0.0.0.0|::)"
```

### **2. Network Policies**

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

#### **Firewall Rules**
```bash
# Docker automatically creates iptables rules
# View Docker-related rules
sudo iptables -L DOCKER
sudo iptables -L DOCKER-USER

# Custom firewall rules
sudo iptables -I DOCKER-USER -s 172.17.0.0/16 -d 192.168.1.0/24 -j DROP

# Block specific ports
sudo iptables -I DOCKER-USER -p tcp --dport 22 -j DROP
```

## 💾 File System Security

### **1. File System Monitoring**

#### **File Access Monitoring**
```bash
# Monitor file system changes
docker exec container_name find / -type f -mtime -1

# Check for new files
docker exec container_name find / -type f -newer /tmp/reference

# Monitor specific directories
docker exec container_name ls -la /tmp/
docker exec container_name ls -la /var/log/
```

#### **File Integrity Monitoring**
```bash
# Calculate file hashes
docker exec container_name find /app -type f -exec sha256sum {} \;

# Monitor critical files
docker exec container_name stat /etc/passwd
docker exec container_name stat /etc/shadow

# Check file permissions
docker exec container_name find /app -type f -perm /o+w
```

### **2. Read-Only File Systems**

#### **Implementing Read-Only File Systems**
```bash
# Run container with read-only root filesystem
docker run -d --name secure-app \
  --read-only \
  myapp:latest

# With temporary writable directories
docker run -d --name secure-app \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /var/log \
  --tmpfs /var/cache \
  myapp:latest
```

#### **Docker Compose Configuration**
```yaml
version: '3.8'
services:
  app:
    image: myapp:latest
    read_only: true
    tmpfs:
      - /tmp
      - /var/log
      - /var/cache
      - /run
```

## 🔐 Capability Management

### **1. Linux Capabilities**

#### **Understanding Capabilities**
```bash
# Linux capabilities provide fine-grained permissions
# Docker drops most capabilities by default

# View container capabilities
docker inspect container_name | grep -A 10 "Capabilities"

# Check current capabilities
docker exec container_name cat /proc/1/status | grep CapEff
```

#### **Capability Management**
```bash
# Run with no capabilities
docker run -d --name secure-app \
  --cap-drop ALL \
  myapp:latest

# Add specific capabilities
docker run -d --name app \
  --cap-add NET_BIND_SERVICE \
  myapp:latest

# Drop dangerous capabilities
docker run -d --name app \
  --cap-drop SYS_ADMIN \
  --cap-drop SYS_MODULE \
  myapp:latest
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

### **2. Seccomp Profiles**

#### **System Call Filtering**
```bash
# Seccomp filters system calls
# Docker includes default seccomp profile

# View seccomp configuration
docker inspect container_name | grep -A 5 "SeccompProfile"

# Run with custom seccomp profile
docker run -d --name app \
  --security-opt seccomp=./custom-profile.json \
  myapp:latest

# Run without seccomp (not recommended)
docker run -d --name app \
  --security-opt seccomp=unconfined \
  myapp:latest
```

## 🛡️ Security Profiles

### **1. AppArmor Profiles**

#### **AppArmor Implementation**
```bash
# AppArmor provides mandatory access control
# Docker includes default AppArmor profiles

# View AppArmor status
docker inspect container_name | grep -A 5 "AppArmorProfile"

# Run with custom profile
docker run -d --name app \
  --security-opt apparmor=my-profile \
  myapp:latest

# Run without AppArmor (not recommended)
docker run -d --name app \
  --security-opt apparmor=unconfined \
  myapp:latest
```

#### **Custom AppArmor Profile Example**
```bash
# /etc/apparmor.d/docker-app
#include <tunables/global>

profile docker-app flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>
  
  # Application files
  /app/** r,
  /app/bin/** rx,
  
  # Temporary directories
  /tmp/** rw,
  /var/tmp/** rw,
  
  # Logging
  /var/log/** rw,
  
  # Network
  network,
  
  # Deny dangerous operations
  deny /proc/sys/** w,
  deny /sys/** w,
}
```

### **2. SELinux Profiles**

#### **SELinux Implementation**
```bash
# SELinux provides mandatory access control
# Common on RHEL/CentOS systems

# View SELinux status
docker inspect container_name | grep -A 5 "SELinuxOptions"

# Run with SELinux labels
docker run -d --name app \
  --security-opt label=type:container_runtime_t \
  myapp:latest

# Check SELinux context
docker exec container_name ls -Z
```

## 🔍 Runtime Monitoring Tools

### **1. Falco - Runtime Security Monitoring**

#### **What is Falco?**
Falco is a cloud-native runtime security monitoring tool that detects anomalous activity in your containers.

#### **Installing Falco**
```bash
# Install Falco
curl -s https://falco.org/repo/falcosecurity-367C50BF.key | apt-key add -
echo "deb https://download.falco.org/packages/deb stable main" | tee -a /etc/apt/sources.list.d/falcosecurity.list
apt-get update
apt-get install -y falco

# Run Falco
falco
```

#### **Falco Rules Example**
```yaml
# /etc/falco/falco_rules.yaml
- rule: Unexpected Process
  desc: Detect unexpected processes
  condition: spawned_process and not proc.name in (expected_processes)
  output: Unexpected process started (user=%user.name command=%proc.cmdline)
  priority: WARNING

- rule: Container Escape
  desc: Detect container escape attempts
  condition: evt.type=execve and proc.name=sh and container and proc.args contains "-c" and proc.args contains "mount"
  output: Container escape detected (user=%user.name command=%proc.cmdline)
  priority: CRITICAL
```

### **2. Docker Runtime Security**

#### **Built-in Security Features**
```bash
# Docker includes several runtime security features:
- Content trust (DCT)
- Secrets management
- Runtime security options
- Network security
- Resource limits
```

#### **Runtime Security Options**
```bash
# Security options when running containers
docker run -d --name secure-app \
  --read-only \
  --cap-drop ALL \
  --security-opt apparmor=docker-default \
  --security-opt seccomp=default \
  --user 1000:1000 \
  myapp:latest
```

## 🚨 Incident Response

### **1. Security Event Detection**

#### **Monitoring for Security Events**
```bash
# Monitor container logs
docker logs -f container_name

# Monitor system calls
docker run --security-opt seccomp=audit myapp

# Monitor file access
docker run --security-opt apparmor=audit myapp

# Monitor network activity
docker exec container_name tcpdump -i any
```

#### **Automated Alerting**
```bash
# Set up monitoring scripts
#!/bin/bash
# monitor-container.sh

CONTAINER_NAME=$1
LOG_FILE="/var/log/container-monitor.log"

# Monitor for suspicious processes
docker exec $CONTAINER_NAME ps aux | grep -E "(nc|netcat|bash|sh)" && \
echo "$(date): Suspicious process detected in $CONTAINER_NAME" >> $LOG_FILE

# Monitor for new files
docker exec $CONTAINER_NAME find /tmp -type f -newer /tmp/reference && \
echo "$(date): New files detected in $CONTAINER_NAME" >> $LOG_FILE
```

### **2. Incident Response Procedures**

#### **Containment Steps**
```bash
# 1. Stop the affected container
docker stop container_name

# 2. Isolate the container
docker network disconnect bridge container_name

# 3. Preserve evidence
docker export container_name > container-backup.tar
docker inspect container_name > container-info.json

# 4. Investigate the incident
docker logs container_name > container-logs.txt
```

#### **Recovery Procedures**
```bash
# 1. Remove compromised container
docker rm container_name

# 2. Update base images
docker pull myapp:latest

# 3. Rebuild with security fixes
docker build --no-cache -t myapp:latest .

# 4. Deploy new secure container
docker run -d --name new-app \
  --read-only \
  --cap-drop ALL \
  myapp:latest
```

## 📊 Security Metrics and Monitoring

### **1. Key Security Metrics**

#### **Runtime Security KPIs**
```bash
# Security metrics to track:
- Number of security violations
- Time to detect incidents
- Time to respond to incidents
- Number of privileged containers
- Network policy violations
- File system integrity violations
```

#### **Monitoring Dashboard**
```bash
# Create security monitoring dashboard
# Track container security status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | \
while read line; do
  echo "$(date): $line"
done >> /var/log/container-security.log
```

### **2. Continuous Security Monitoring**

#### **Automated Security Checks**
```bash
#!/bin/bash
# security-check.sh

# Check for privileged containers
docker ps --format "{{.Names}}" | while read container; do
  if docker inspect $container | grep -q "Privileged.*true"; then
    echo "WARNING: Privileged container detected: $container"
  fi
done

# Check for containers running as root
docker ps --format "{{.Names}}" | while read container; do
  if docker exec $container id | grep -q "uid=0"; then
    echo "WARNING: Container running as root: $container"
  fi
done
```

## 🎯 Best Practices

### **1. Runtime Security Strategy**
- **Implement defense in depth** with multiple security layers
- **Monitor continuously** for security events
- **Use least privilege** principle for all containers
- **Regular security assessments** and penetration testing

### **2. Incident Response Planning**
- **Develop incident response** procedures
- **Train teams** on security incident handling
- **Practice incident response** scenarios
- **Document lessons learned** from incidents

### **3. Continuous Improvement**
- **Regular security reviews** and assessments
- **Update security policies** based on threats
- **Monitor security metrics** and trends
- **Stay informed** about new security threats

## 🚀 Next Steps

Now that you understand runtime security, let's explore:

1. **Best Practices** - Proven security strategies
2. **Compliance** - Meeting regulatory requirements
3. **Incident Response** - Handling security breaches
4. **Advanced Security** - Advanced protection techniques

---

*Runtime security is crucial for protecting your containers while they are running. Continuous monitoring and rapid response capabilities are essential for maintaining container security.* 