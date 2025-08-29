# 📋 Compliance: Meeting Regulatory Requirements

## 🎯 Understanding Container Compliance

Compliance in container environments involves meeting various regulatory requirements, industry standards, and organizational policies. This includes data protection, security standards, audit requirements, and governance frameworks.

## 🔍 Why Compliance Matters

### **Regulatory Landscape**
```bash
# Major compliance frameworks:
- GDPR (General Data Protection Regulation)
- HIPAA (Health Insurance Portability and Accountability Act)
- SOX (Sarbanes-Oxley Act)
- PCI DSS (Payment Card Industry Data Security Standard)
- ISO 27001 (Information Security Management)
- NIST Cybersecurity Framework
- SOC 2 (System and Organization Controls)

# Industry-specific requirements:
- Financial services (Basel III, Dodd-Frank)
- Healthcare (HITECH, FDA regulations)
- Government (FISMA, FedRAMP)
- Energy (NERC CIP)
- Telecommunications (CALEA, CPNI)
```

### **Compliance Challenges in Containers**
```bash
# Container-specific compliance challenges:
- Ephemeral nature of containers
- Shared kernel security
- Complex networking and storage
- Rapid deployment cycles
- Limited audit trails
- Supply chain security
- Data residency requirements
```

## 🏗️ Compliance Framework

### **1. Data Protection Compliance**

#### **GDPR Requirements**
```bash
# Key GDPR requirements for containers:
- Data minimization and purpose limitation
- Data encryption in transit and at rest
- Right to be forgotten
- Data portability
- Privacy by design and default
- Breach notification (72 hours)
- Data protection impact assessments

# Container implementation:
- Encrypt container data volumes
- Implement data retention policies
- Use data anonymization techniques
- Monitor data access and usage
- Implement data deletion procedures
```

#### **HIPAA Compliance**
```bash
# HIPAA requirements for containers:
- Administrative safeguards
- Physical safeguards
- Technical safeguards
- Privacy rule compliance
- Breach notification
- Business associate agreements

# Container security measures:
- Access controls and authentication
- Audit logging and monitoring
- Data encryption
- Network segmentation
- Incident response procedures
```

### **2. Security Standards Compliance**

#### **PCI DSS Requirements**
```bash
# PCI DSS requirements:
- Build and maintain secure networks
- Protect cardholder data
- Maintain vulnerability management
- Implement strong access controls
- Monitor and test networks
- Maintain information security policy

# Container security controls:
- Network segmentation and isolation
- Data encryption and tokenization
- Vulnerability scanning and patching
- Access control and authentication
- Security monitoring and logging
- Security policy enforcement
```

#### **ISO 27001 Compliance**
```bash
# ISO 27001 domains:
- Information security policies
- Organization of information security
- Human resource security
- Asset management
- Access control
- Cryptography
- Physical and environmental security
- Operations security
- Communications security
- System acquisition and maintenance
- Supplier relationships
- Information security incident management
- Business continuity management
- Compliance

# Container implementation:
- Security policies and procedures
- Asset inventory and classification
- Access control and authentication
- Encryption and key management
- Security monitoring and logging
- Incident response and recovery
- Business continuity planning
```

## 🔒 Technical Compliance Controls

### **1. Access Control Compliance**

#### **Identity and Access Management**
```bash
# Compliance requirements:
- Unique user identification
- Multi-factor authentication
- Role-based access control
- Privileged access management
- Access review and recertification
- Session management

# Container implementation:
docker run -d --name secure-app \
  --user 1000:1000 \
  --cap-drop ALL \
  --security-opt apparmor=docker-default \
  myapp:latest

# User management
RUN adduser -D -s /bin/false appuser && \
    addgroup -g 1001 appgroup && \
    adduser -G appgroup appuser
USER appuser
```

#### **Authentication and Authorization**
```yaml
# docker-compose.yml with security
version: '3.8'
services:
  app:
    image: myapp:latest
    user: "1000:1000"
    cap_drop:
      - ALL
    security_opt:
      - apparmor=docker-default
      - seccomp=default
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - AUTH_PROVIDER=ldap
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    external: true
```

### **2. Data Protection Compliance**

#### **Data Encryption**
```bash
# Encrypt data at rest
docker run -d --name secure-app \
  -v encrypted-volume:/app/data \
  myapp:latest

# Create encrypted volume
docker volume create \
  --driver local \
  --opt type=ext4 \
  --opt device=/dev/mapper/encrypted-volume \
  encrypted-volume

# Encrypt data in transit
# Use TLS/SSL for all communications
# Implement certificate management
```

#### **Data Classification and Handling**
```yaml
# Data classification in containers
version: '3.8'
services:
  app:
    image: myapp:latest
    labels:
      - "data.classification=confidential"
      - "data.retention=7years"
      - "data.encryption=required"
    volumes:
      - confidential_data:/app/confidential
      - public_data:/app/public
    environment:
      - DATA_CLASSIFICATION=confidential
      - ENCRYPTION_REQUIRED=true

volumes:
  confidential_data:
    driver: local
    driver_opts:
      type: ext4
      device: /dev/mapper/encrypted-volume
  public_data:
    driver: local
```

### **3. Network Security Compliance**

#### **Network Segmentation**
```bash
# Create compliance-compliant networks
docker network create --internal secure-backend
docker network create dmz
docker network create public

# Place containers in appropriate zones
docker run -d --name db --network secure-backend postgres:13
docker run -d --name api --network dmz myapi:latest
docker run -d --name web -p 80:80 --network public nginx:latest

# Firewall rules for compliance
sudo iptables -I DOCKER-USER -s 172.17.0.0/16 -d 192.168.1.0/24 -j DROP
sudo iptables -I DOCKER-USER -p tcp --dport 22 -j DROP
```

#### **Network Monitoring and Logging**
```yaml
# Network monitoring for compliance
version: '3.8'
services:
  app:
    image: myapp:latest
    networks:
      - secure-backend
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  monitor:
    image: nginx:alpine
    networks:
      - secure-backend
    volumes:
      - ./monitoring:/etc/nginx/html
    command: nginx -g 'daemon off;'

networks:
  secure-backend:
    internal: true
```

## 📊 Audit and Monitoring Compliance

### **1. Audit Logging**

#### **Comprehensive Logging**
```bash
# Enable comprehensive logging
docker run -d --name app \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp:latest

# Log all container activities
docker logs -f container_name

# Export logs for compliance
docker logs container_name > compliance-logs.txt
```

#### **Structured Logging**
```yaml
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
        labels: "compliance=true"
        env: "LOG_LEVEL=INFO"
        tag: "{{.Name}}/{{.ID}}"
```

### **2. Security Monitoring**

#### **Continuous Monitoring**
```bash
# Monitor container security
docker stats container_name

# Monitor resource usage
docker exec container_name df -h
docker exec container_name free -h

# Monitor network activity
docker exec container_name netstat -tuln

# Monitor process activity
docker exec container_name ps aux
```

#### **Security Event Detection**
```bash
# Monitor for security events
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

## 🔍 Compliance Assessment Tools

### **1. Automated Compliance Scanning**

#### **OpenSCAP Integration**
```bash
# Install OpenSCAP
apt-get install -y openscap-utils

# Scan container for compliance
oscap-docker image myapp:latest xccdf eval \
  --profile xccdf_org.ssgproject.content_profile_docker \
  --results results.xml \
  --report report.html

# Generate compliance report
oscap xccdf generate report results.xml > compliance-report.html
```

#### **InSpec Compliance Testing**
```bash
# Install InSpec
curl -L https://omnitruck.chef.io/install.sh | bash -s -- -P inspec

# Create compliance profile
# inspec.yml
name: docker-compliance
title: Docker Container Compliance
maintainer: Security Team
copyright: Security Team
copyright_email: security@company.com
license: Apache-2.0
version: 1.0.0

# Run compliance tests
inspec exec docker-compliance
```

### **2. Policy Compliance Checking**

#### **Anchore Policy Engine**
```bash
# Install Anchore
pip install anchorecli

# Add image for analysis
anchore-cli image add myapp:latest

# Wait for analysis
anchore-cli image wait myapp:latest

# Check policy compliance
anchore-cli evaluate check myapp:latest

# View policy evaluation
anchore-cli evaluate list myapp:latest
```

#### **Custom Policy Validation**
```bash
#!/bin/bash
# compliance-check.sh

IMAGE_NAME=$1
COMPLIANCE_FAILED=false

# Check for root user
if docker run --rm $IMAGE_NAME id | grep -q "uid=0"; then
    echo "FAIL: Container runs as root"
    COMPLIANCE_FAILED=true
fi

# Check for latest tag
if echo $IMAGE_NAME | grep -q ":latest"; then
    echo "FAIL: Using latest tag"
    COMPLIANCE_FAILED=true
fi

# Check for excessive capabilities
if docker run --rm $IMAGE_NAME cat /proc/1/status | grep -q "SYS_ADMIN"; then
    echo "FAIL: Container has SYS_ADMIN capability"
    COMPLIANCE_FAILED=true
fi

# Exit with failure if compliance issues found
if [ "$COMPLIANCE_FAILED" = true ]; then
    exit 1
fi

echo "PASS: Container meets compliance requirements"
```

## 📋 Compliance Documentation

### **1. Compliance Reports**

#### **Automated Report Generation**
```bash
#!/bin/bash
# generate-compliance-report.sh

REPORT_DATE=$(date +%Y-%m-%d)
REPORT_FILE="compliance-report-${REPORT_DATE}.md"

cat > $REPORT_FILE << EOF
# Container Compliance Report
Generated: $REPORT_DATE

## Executive Summary
Container compliance assessment for production environment.

## Compliance Status
- Overall Status: [COMPLIANT/NON-COMPLIANT]
- Critical Issues: [COUNT]
- High Issues: [COUNT]
- Medium Issues: [COUNT]
- Low Issues: [COUNT]

## Detailed Findings

### Critical Issues
[LIST CRITICAL ISSUES]

### High Issues
[LIST HIGH ISSUES]

### Medium Issues
[LIST MEDIUM ISSUES]

### Low Issues
[LIST LOW ISSUES]

## Recommendations
[LIST RECOMMENDATIONS]

## Next Steps
[LIST NEXT STEPS]
EOF

echo "Compliance report generated: $REPORT_FILE"
```

#### **Compliance Dashboard**
```yaml
# Compliance monitoring dashboard
version: '3.8'
services:
  dashboard:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./dashboards:/etc/grafana/provisioning/dashboards

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

volumes:
  grafana-storage:
  prometheus-data:
```

## 🚨 Incident Response Compliance

### **1. Breach Notification Procedures**

#### **GDPR Breach Notification**
```bash
# GDPR breach notification (72 hours)
#!/bin/bash
# breach-notification.sh

BREACH_DATE=$(date)
BREACH_DETAILS="Container security breach detected"
AFFECTED_DATA="User data, configuration files"
IMPACT_LEVEL="HIGH"

# Generate breach notification
cat > breach-notification-$(date +%Y%m%d_%H%M%S).txt << EOF
BREACH NOTIFICATION
Date: $BREACH_DATE
Details: $BREACH_DETAILS
Affected Data: $AFFECTED_DATA
Impact Level: $IMPACT_LEVEL
Actions Taken: [LIST ACTIONS]
Next Steps: [LIST NEXT STEPS]
EOF

# Send notification to authorities
# [IMPLEMENT NOTIFICATION LOGIC]

echo "Breach notification generated and sent"
```

#### **HIPAA Breach Notification**
```bash
# HIPAA breach notification (60 days)
#!/bin/bash
# hipaa-breach-notification.sh

BREACH_DATE=$(date)
PATIENTS_AFFECTED=0
BREACH_TYPE="Unauthorized access to PHI"

# Generate HIPAA breach report
cat > hipaa-breach-report-$(date +%Y%m%d).txt << EOF
HIPAA BREACH REPORT
Date: $BREACH_DATE
Patients Affected: $PATIENTS_AFFECTED
Breach Type: $BREACH_TYPE
Risk Assessment: [ASSESSMENT]
Mitigation Steps: [STEPS]
EOF

echo "HIPAA breach report generated"
```

### **2. Compliance Incident Response**

#### **Incident Response Plan**
```bash
# Incident response procedures
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

## 🔄 Continuous Compliance

### **1. Automated Compliance Checking**

#### **CI/CD Compliance Gates**
```yaml
name: Compliance Check
on: [push, pull_request]

jobs:
  compliance:
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
        
    - name: Policy validation
      run: |
        docker run --rm -v $(pwd):/app anchore/grype:latest /app
        
    - name: Deploy only if compliant
      if: success()
      run: docker push myapp:${{ github.sha }}
```

#### **Scheduled Compliance Monitoring**
```bash
# Daily compliance check
0 2 * * * /usr/local/bin/compliance-check.sh

# Weekly compliance report
0 3 * * 0 /usr/local/bin/generate-compliance-report.sh

# Monthly compliance review
0 4 1 * * /usr/local/bin/compliance-review.sh
```

### **2. Compliance Metrics and Reporting**

#### **Key Compliance Metrics**
```bash
# Compliance metrics to track:
- Overall compliance score
- Number of compliance violations
- Time to fix compliance issues
- Policy compliance rate
- Audit log completeness
- Incident response time
- Training completion rate
```

#### **Compliance Dashboard**
```bash
#!/bin/bash
# compliance-dashboard.sh

echo "=== COMPLIANCE DASHBOARD ==="
echo "Date: $(date)"
echo ""

# Check container compliance
echo "Container Compliance:"
docker ps --format "{{.Names}}" | while read container; do
    if ./compliance-check.sh $container; then
        echo "  ✓ $container: COMPLIANT"
    else
        echo "  ✗ $container: NON-COMPLIANT"
    fi
done

echo ""
echo "Security Status:"
echo "  Vulnerabilities: $(trivy image --format json myapp:latest | jq '.Results[].Vulnerabilities | length')"
echo "  Policy Violations: $(anchore-cli evaluate list myapp:latest | grep -c FAIL)"
echo "  Compliance Score: [CALCULATE SCORE]"
```

## 🎯 Best Practices

### **1. Compliance Strategy**
- **Implement compliance by design** from the start
- **Automate compliance checking** in CI/CD pipelines
- **Regular compliance assessments** and audits
- **Continuous monitoring** and reporting

### **2. Documentation and Training**
- **Maintain comprehensive documentation** of compliance controls
- **Regular training** for development and operations teams
- **Clear procedures** for incident response and breach notification
- **Regular updates** to compliance policies and procedures

### **3. Continuous Improvement**
- **Regular compliance reviews** and assessments
- **Update compliance controls** based on new requirements
- **Monitor compliance metrics** and trends
- **Stay informed** about regulatory changes

## 🚀 Next Steps

Now that you understand compliance requirements, let's explore:

1. **Incident Response** - Handling security breaches
2. **Advanced Security** - Advanced protection techniques
3. **Security Automation** - Automating security processes
4. **Risk Management** - Managing security risks

---

*Compliance is essential for organizations operating in regulated industries. Implementing proper compliance controls helps meet regulatory requirements and build trust with customers and stakeholders.* 