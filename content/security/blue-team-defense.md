# 🔵 Blue Team Defense: Building Robust Container Security

## 🎯 Understanding Blue Team Defense

Blue team defense focuses on building robust security controls, implementing detection mechanisms, and responding to security incidents in Docker environments. This section covers defensive strategies, monitoring, and incident response.

## 🛡️ Defense in Depth Strategy

### **1. Container Security Layers**
```bash
# Security layers from outside to inside:
┌─────────────────────────────────────────────────────────────┐
│                    Defense in Depth                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                Network Security                         │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Firewall  │  │   IDS/IPS   │  │   Network   │    │
│  │  │   Rules     │  │   Systems   │  │   Monitoring│    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Host Security                            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Kernel    │  │   System    │  │   Access    │    │
│  │  │   Hardening │  │   Monitoring│  │   Control   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Container Security                       │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Runtime   │  │   Image     │  │   Network   │    │
│  │  │   Security  │  │   Security  │  │   Security  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Application Security                     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Code      │  │   Dependencies│  │   Config   │    │
│  │  │   Security  │  │   Security  │  │   Security  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

### **2. Security Control Implementation**
```bash
# Implement security controls at each layer:
- Network: Firewalls, IDS/IPS, segmentation
- Host: Kernel hardening, system monitoring, access control
- Container: Runtime security, image scanning, network isolation
- Application: Code review, dependency scanning, configuration management
```

## 🔒 Container Hardening

### **1. Secure Container Configuration**
```bash
# Secure container run command
docker run -d --name secure-app \
  --read-only \
  --cap-drop ALL \
  --security-opt apparmor=docker-default \
  --security-opt seccomp=default \
  --user 1000:1000 \
  --pids-limit 100 \
  --memory 512m \
  --cpus 0.5 \
  --tmpfs /tmp \
  --tmpfs /var/log \
  --tmpfs /var/cache \
  --network secure-backend \
  myapp:latest
```

### **2. Security Profile Implementation**
```bash
# Custom AppArmor profile
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
  deny /dev/** w,
  deny /boot/** r,
  deny /etc/passwd r,
  deny /etc/shadow r,
}
```

### **3. Resource Limits and Constraints**
```bash
# Set strict resource limits
docker run -d --name secure-app \
  --memory 512m \
  --memory-swap 512m \
  --cpus 0.5 \
  --pids-limit 100 \
  --ulimit nofile=1024:1024 \
  --ulimit nproc=100:100 \
  myapp:latest

# Docker Compose configuration
version: '3.8'
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
          pids: 100
        reservations:
          memory: 256M
          cpus: '0.25'
```

## 🌐 Network Security Defense

### **1. Network Segmentation**
```bash
# Create security zones
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

### **2. Firewall Rules**
```bash
# Docker iptables rules
sudo iptables -I DOCKER-USER -s 172.17.0.0/16 -d 192.168.1.0/24 -j DROP
sudo iptables -I DOCKER-USER -p tcp --dport 22 -j DROP
sudo iptables -I DOCKER-USER -p tcp --dport 3306 -j DROP

# Block specific IP ranges
sudo iptables -I DOCKER-USER -s 10.0.0.0/8 -j DROP
sudo iptables -I DOCKER-USER -s 192.168.0.0/16 -j DROP

# Allow only specific traffic
sudo iptables -I DOCKER-USER -p tcp --dport 80 -s 192.168.1.0/24 -j ACCEPT
sudo iptables -I DOCKER-USER -p tcp --dport 443 -s 192.168.1.0/24 -j ACCEPT
```

### **3. Encrypted Communication**
```bash
# TLS/SSL configuration
docker run -d --name secure-app \
  -v /etc/ssl/certs:/etc/ssl/certs \
  -v /etc/ssl/private:/etc/ssl/private \
  -e SSL_CERT=/etc/ssl/certs/cert.pem \
  -e SSL_KEY=/etc/ssl/private/key.pem \
  -e SSL_VERIFY=true \
  myapp:latest

# Certificate management
# Use Let's Encrypt for free certificates
# Implement certificate rotation
# Monitor certificate expiration
```

## 🔍 Monitoring and Detection

### **1. Security Monitoring Tools**
```bash
# Runtime monitoring
docker stats container_name
docker logs -f container_name

# Process monitoring
docker exec container_name ps aux
docker exec container_name pstree

# Network monitoring
docker exec container_name netstat -tuln
docker exec container_name ss -tuln

# File system monitoring
docker exec container_name find /tmp -type f -newer /tmp/reference
```

### **2. Anomaly Detection**
```bash
#!/bin/bash
# security-monitor.sh

CONTAINER_NAME=$1
LOG_FILE="/var/log/security-events.log"

# Monitor for privilege escalation
docker exec $CONTAINER_NAME id | grep -q "uid=0" && \
echo "$(date): Root access detected in $CONTAINER_NAME" >> $LOG_FILE

# Monitor for new processes
docker exec $CONTAINER_NAME ps aux | grep -v -E "(PID|ps|grep)" && \
echo "$(date): New process detected in $CONTAINER_NAME" >> $LOG_FILE

# Monitor for network changes
docker exec $CONTAINER_NAME netstat -tuln | grep -E ":(22|3306|5432)" && \
echo "$(date): Suspicious network activity in $CONTAINER_NAME" >> $LOG_FILE

# Monitor for file changes
docker exec $CONTAINER_NAME find /tmp -type f -newer /tmp/reference && \
echo "$(date): New files detected in $CONTAINER_NAME" >> $LOG_FILE
```

### **3. Security Event Logging**
```bash
# Enable comprehensive logging
docker run -d --name app \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  --log-opt labels=security=true \
  --log-opt env=LOG_LEVEL=INFO \
  myapp:latest

# Structured logging for compliance
version: '3.8'
services:
  app:
    image: myapp:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "security=true,compliance=true"
        env: "LOG_LEVEL=INFO"
        tag: "{{.Name}}/{{.ID}}"
```

## 🚨 Incident Response

### **1. Incident Response Plan**
```bash
#!/bin/bash
# incident-response.sh

INCIDENT_TYPE=$1
SEVERITY=$2

case $SEVERITY in
  "CRITICAL")
    echo "CRITICAL INCIDENT: Immediate response required"
    # Stop affected containers
    docker stop $(docker ps -q)
    # Isolate network
    docker network disconnect bridge $(docker ps -q)
    # Notify security team
    echo "CRITICAL: Security team notified"
    # Preserve evidence
    docker export container_name > container-backup.tar
    docker inspect container_name > container-info.json
    ;;
  "HIGH")
    echo "HIGH INCIDENT: Response within 1 hour"
    # Monitor affected containers
    docker logs -f $(docker ps -q)
    # Generate incident report
    echo "HIGH: Incident report generated"
    ;;
  "MEDIUM")
    echo "MEDIUM INCIDENT: Response within 4 hours"
    # Document incident
    echo "MEDIUM: Incident documented"
    ;;
  "LOW")
    echo "LOW INCIDENT: Response within 24 hours"
    # Log incident
    echo "LOW: Incident logged"
    ;;
esac
```

### **2. Evidence Collection**
```bash
# Collect container evidence
docker export container_name > container-backup.tar
docker inspect container_name > container-info.json
docker logs container_name > container-logs.txt

# Collect host evidence
ps aux > host-processes.txt
netstat -tuln > host-network.txt
ls -la /var/lib/docker/overlay2/ > host-filesystem.txt

# Collect network evidence
tcpdump -i any -w network-capture.pcap
```

### **3. Containment and Recovery**
```bash
# Containment steps
docker stop container_name
docker network disconnect bridge container_name
docker network disconnect secure-backend container_name

# Recovery steps
docker rm container_name
docker pull myapp:latest
docker build --no-cache -t myapp:latest .
docker run -d --name new-app --network secure-backend myapp:latest
```

## 🔄 Continuous Security

### **1. Automated Security Scanning**
```bash
# CI/CD security gates
name: Security Pipeline
on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build image
      run: docker build -t myapp:${{ github.sha }} .
      
    - name: Security scan
      run: |
        trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:${{ github.sha }}
        
    - name: Compliance check
      run: |
        ./compliance-check.sh myapp:${{ github.sha }}
        
    - name: Deploy only if secure
      if: success()
      run: docker push myapp:${{ github.sha }}
```

### **2. Security Metrics and Reporting**
```bash
#!/bin/bash
# security-dashboard.sh

echo "=== SECURITY DASHBOARD ==="
echo "Date: $(date)"
echo ""

# Check container security
echo "Container Security:"
docker ps --format "{{.Names}}" | while read container; do
    if ./security-check.sh $container; then
        echo "  ✓ $container: SECURE"
    else
        echo "  ✗ $container: VULNERABLE"
    fi
done

echo ""
echo "Security Status:"
echo "  Vulnerabilities: $(trivy image --format json myapp:latest | jq '.Results[].Vulnerabilities | length')"
echo "  Policy Violations: $(anchore-cli evaluate list myapp:latest | grep -c FAIL)"
echo "  Security Score: [CALCULATE SCORE]"
```

## 🎯 Best Practices

### **1. Security Strategy**
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

Now that you understand blue team defense, let's explore:

1. **Incident Response** - Handling security breaches
2. **Threat Hunting** - Proactive threat detection
3. **Security Automation** - Automating security processes
4. **Risk Management** - Managing security risks

---

*Blue team defense is essential for protecting containerized applications. Implementing robust security controls and monitoring helps detect and respond to security threats effectively.* 