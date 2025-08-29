# ⚡ Image Optimization: Performance & Efficiency

## 🎯 Why Optimize Docker Images?

Image optimization is crucial for faster deployments, reduced storage costs, improved security, and better performance. A well-optimized image can be 10-100x smaller than an unoptimized one, leading to significant improvements in deployment speed and resource usage.

## 📊 Image Size Impact

### **Size Comparison Examples**
```bash
# Unoptimized Node.js image
FROM node:latest                    # ~900MB base image
COPY . /app                        # +100MB source code
RUN npm install                    # +500MB node_modules
# Total: ~1.5GB

# Optimized Node.js image
FROM node:16-alpine                # ~100MB base image
COPY package*.json /app/           # +1MB package files
RUN npm ci --only=production       # +50MB production dependencies
COPY src /app/src                  # +10MB source code only
# Total: ~160MB (90% reduction!)
```

### **Performance Benefits**
```bash
# Image pull time comparison:
1.5GB image: ~5-15 minutes on slow connection
160MB image: ~30-90 seconds on slow connection

# Storage cost comparison:
1.5GB × 100 deployments = 150GB storage
160MB × 100 deployments = 16GB storage (90% savings)

# Security benefits:
Large images: More packages = more vulnerabilities
Small images: Fewer packages = smaller attack surface
```

## 🏗️ Base Image Optimization

### **1. Choose Minimal Base Images**

#### **Alpine Linux Images**
```dockerfile
# Standard vs Alpine comparison
FROM node:16          # 900MB
FROM node:16-alpine   # 100MB (90% smaller)

FROM python:3.9       # 800MB  
FROM python:3.9-alpine # 45MB (94% smaller)

FROM openjdk:11       # 600MB
FROM openjdk:11-alpine # 150MB (75% smaller)
```

#### **Distroless Images**
```dockerfile
# Google Distroless - even smaller and more secure
FROM gcr.io/distroless/java:11    # ~50MB
FROM gcr.io/distroless/python3    # ~25MB
FROM gcr.io/distroless/nodejs     # ~30MB
FROM gcr.io/distroless/static     # ~2MB (for static binaries)

# Distroless example
FROM golang:1.19-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp

FROM gcr.io/distroless/static
COPY --from=builder /app/myapp /
ENTRYPOINT ["/myapp"]
```

#### **Scratch Images**
```dockerfile
# Ultimate minimal base - empty image
FROM scratch

# Only works with static binaries
COPY myapp /
ENTRYPOINT ["/myapp"]

# Example with Go static binary
FROM golang:1.19-alpine AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o myapp .

FROM scratch
COPY --from=builder /app/myapp /
ENTRYPOINT ["/myapp"]
```

### **2. Base Image Selection Guide**

#### **Language-Specific Recommendations**
```dockerfile
# Node.js - Best practices
FROM node:16-alpine                 # Production
FROM node:16-alpine3.16            # Specific Alpine version
FROM gcr.io/distroless/nodejs      # Ultra-secure

# Python - Best practices  
FROM python:3.9-alpine             # General use
FROM python:3.9-slim               # Debian-based, smaller than full
FROM gcr.io/distroless/python3     # Ultra-minimal

# Java - Best practices
FROM openjdk:11-jre-alpine         # Runtime only
FROM eclipse-temurin:11-jre-alpine # OpenJDK distribution
FROM gcr.io/distroless/java:11     # Ultra-minimal

# Go - Best practices
FROM golang:1.19-alpine AS builder
FROM scratch                       # Final stage - smallest possible
```

## 🏗️ Multi-Stage Build Optimization

### **1. Separating Build and Runtime**

#### **Node.js Multi-Stage Example**
```dockerfile
# Build stage
FROM node:16-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source and build
COPY src ./src
RUN npm run build

# Production stage
FROM node:16-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy only production files
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

USER nextjs
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

#### **Python Multi-Stage Example**
```dockerfile
# Build stage
FROM python:3.9-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev libffi-dev

# Install Python dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.9-alpine AS production
WORKDIR /app

# Copy only the installed packages
COPY --from=builder /root/.local /root/.local

# Copy application
COPY src ./src

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Create non-root user
RUN adduser -D -s /bin/sh appuser
USER appuser

CMD ["python", "src/app.py"]
```

#### **Java Multi-Stage Example**
```dockerfile
# Build stage
FROM maven:3.8-openjdk-11-slim AS builder
WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Production stage
FROM openjdk:11-jre-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy only the jar file
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### **2. Advanced Multi-Stage Patterns**

#### **Multi-Architecture Builds**
```dockerfile
# Build for multiple architectures
FROM --platform=$BUILDPLATFORM golang:1.19-alpine AS builder
ARG BUILDPLATFORM
ARG TARGETPLATFORM
ARG TARGETOS
ARG TARGETARCH

WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o myapp

FROM alpine:latest
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/myapp /
ENTRYPOINT ["/myapp"]
```

#### **Conditional Stages**
```dockerfile
# Development stage
FROM node:16-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Test stage
FROM development AS test
RUN npm run test
RUN npm run lint

# Production build stage
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
```

## 📦 Layer Optimization

### **1. Layer Caching Strategies**

#### **Optimal Layer Ordering**
```dockerfile
# Bad - changes to source code invalidate package cache
FROM node:16-alpine
WORKDIR /app
COPY . .                           # This changes frequently
RUN npm install                    # Cache invalidated every time

# Good - package.json changes less frequently than source
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./              # Changes infrequently
RUN npm install                    # Cache preserved
COPY . .                          # Source changes don't affect packages
```

#### **Combining RUN Commands**
```dockerfile
# Bad - creates multiple layers
FROM alpine:latest
RUN apk add --no-cache curl
RUN apk add --no-cache wget
RUN apk add --no-cache git
RUN rm -rf /var/cache/apk/*

# Good - single layer
FROM alpine:latest
RUN apk add --no-cache curl wget git && \
    rm -rf /var/cache/apk/*
```

#### **Using .dockerignore**
```dockerignore
# .dockerignore file
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.vscode
.idea
*.md
tests/
docs/
```

### **2. Package Manager Optimization**

#### **Node.js/npm Optimization**
```dockerfile
FROM node:16-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf ~/.npm /tmp/*

# Copy source code
COPY . .

# Remove development files
RUN rm -rf tests/ docs/ *.md .git*
```

#### **Python/pip Optimization**
```dockerfile
FROM python:3.9-alpine
WORKDIR /app

# Install system dependencies in one layer
RUN apk add --no-cache --virtual .build-deps \
    gcc musl-dev libffi-dev && \
    apk add --no-cache postgresql-dev

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    apk del .build-deps

# Copy application
COPY . .
```

#### **Java/Maven Optimization**
```dockerfile
FROM maven:3.8-openjdk-11-slim AS builder
WORKDIR /app

# Copy POM first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Production stage
FROM openjdk:11-jre-alpine
COPY --from=builder /app/target/*.jar app.jar

# Optimize JVM for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
```

## 🗑️ Cleanup and Minimization

### **1. Removing Unnecessary Files**

#### **System Cleanup**
```dockerfile
FROM ubuntu:20.04

# Install packages and clean up in same layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    wget \
    ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

#### **Development Tools Removal**
```dockerfile
# Multi-stage to remove build tools
FROM alpine:latest AS builder
RUN apk add --no-cache gcc musl-dev make
COPY . .
RUN make build

FROM alpine:latest AS production
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/binary /usr/local/bin/
# Build tools not included in final image
```

### **2. File System Optimization**

#### **Using Specific COPY Commands**
```dockerfile
# Bad - copies everything
COPY . .

# Good - copy only what's needed
COPY src/ ./src/
COPY package.json ./
COPY config/ ./config/
```

#### **Removing Cache and Temporary Files**
```dockerfile
FROM node:16-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf ~/.npm /tmp/* /var/cache/apk/* /root/.cache

COPY . .
```

## 🔧 Advanced Optimization Techniques

### **1. Static Binary Creation**

#### **Go Static Binaries**
```dockerfile
FROM golang:1.19-alpine AS builder
WORKDIR /app

# Enable static linking
ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GOARCH=amd64

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -a -installsuffix cgo -ldflags="-w -s" -o myapp

FROM scratch
COPY --from=builder /app/myapp /
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
ENTRYPOINT ["/myapp"]
```

#### **Rust Static Binaries**
```dockerfile
FROM rust:1.65-alpine AS builder
WORKDIR /app

# Install musl target for static linking
RUN rustup target add x86_64-unknown-linux-musl

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release --target x86_64-unknown-linux-musl
RUN rm src/main.rs

COPY src ./src
RUN cargo build --release --target x86_64-unknown-linux-musl

FROM scratch
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/myapp /
ENTRYPOINT ["/myapp"]
```

### **2. Binary Compression**

#### **UPX Compression**
```dockerfile
FROM alpine:latest AS compressor
RUN apk add --no-cache upx

COPY --from=builder /app/myapp /tmp/
RUN upx --best --lzma -o /myapp /tmp/myapp

FROM scratch
COPY --from=compressor /myapp /
ENTRYPOINT ["/myapp"]
```

### **3. Security-Focused Optimization**

#### **Distroless with Specific Users**
```dockerfile
FROM gcr.io/distroless/java:11
COPY --from=builder --chown=nonroot:nonroot /app/myapp.jar /app.jar
USER nonroot
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

#### **Read-Only Root Filesystem**
```dockerfile
FROM alpine:latest
RUN adduser -D -s /bin/sh appuser
WORKDIR /app
COPY --chown=appuser:appuser . .
USER appuser

# Run with read-only root filesystem
# docker run --read-only --tmpfs /tmp myapp
```

## 📏 Image Analysis and Monitoring

### **1. Image Analysis Tools**

#### **Docker Image Analysis**
```bash
# Check image layers
docker history myapp:latest

# Analyze image size
docker images myapp:latest

# Detailed image inspection
docker inspect myapp:latest

# Use dive tool for layer analysis
dive myapp:latest
```

#### **Third-Party Analysis Tools**
```bash
# Hadolint - Dockerfile linter
hadolint Dockerfile

# Container-diff - compare images
container-diff analyze myapp:v1 myapp:v2

# Trivy - vulnerability scanner
trivy image myapp:latest

# Anchore - security scanning
anchore-cli image add myapp:latest
anchore-cli image wait myapp:latest
anchore-cli image vuln myapp:latest all
```

### **2. Size Monitoring**

#### **Automated Size Tracking**
```bash
#!/bin/bash
# size-check.sh
IMAGE_NAME=$1
THRESHOLD_MB=500

SIZE_MB=$(docker images --format "table {{.Size}}" $IMAGE_NAME | tail -1 | sed 's/MB//')

if (( $(echo "$SIZE_MB > $THRESHOLD_MB" | bc -l) )); then
    echo "WARNING: Image $IMAGE_NAME is ${SIZE_MB}MB, exceeds threshold of ${THRESHOLD_MB}MB"
    exit 1
fi

echo "Image $IMAGE_NAME size: ${SIZE_MB}MB (within threshold)"
```

## 🎯 Optimization Best Practices

### **1. Development Workflow**
- **Use multi-stage builds** to separate build and runtime
- **Order layers by change frequency** (least to most frequent)
- **Use .dockerignore** to exclude unnecessary files
- **Choose minimal base images** appropriate for your use case

### **2. Production Considerations**
- **Security scanning** of optimized images
- **Performance testing** with smaller images
- **Monitoring deployment times** and resource usage
- **Regular image updates** and vulnerability patches

### **3. CI/CD Integration**
```yaml
# GitHub Actions example
name: Build Optimized Image
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build image
      run: docker build -t myapp:${{ github.sha }} .
      
    - name: Check image size
      run: |
        SIZE=$(docker images myapp:${{ github.sha }} --format "{{.Size}}")
        echo "Image size: $SIZE"
        
    - name: Security scan
      run: |
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
          aquasec/trivy image myapp:${{ github.sha }}
```

## 📊 Optimization Results Examples

### **Real-World Size Reductions**
```bash
# Node.js Application
Before: node:16 base (900MB) + app (100MB) = 1000MB
After: node:16-alpine + multi-stage = 120MB
Reduction: 88%

# Python Application  
Before: python:3.9 base (800MB) + deps (200MB) = 1000MB
After: python:3.9-alpine + optimization = 80MB
Reduction: 92%

# Java Application
Before: openjdk:11 base (600MB) + jar (50MB) = 650MB
After: distroless/java + optimization = 120MB
Reduction: 82%

# Go Application
Before: golang:1.19 base (900MB) + binary (10MB) = 910MB
After: scratch + static binary = 8MB
Reduction: 99.1%
```

## 🚀 Next Steps

Now that you understand image optimization, let's explore:

1. **Security A-Z** - Complete security guide
2. **Practical Examples** - Hands-on containerization
3. **Production Deployment** - Best practices
4. **Monitoring and Observability** - Container insights

---

*Image optimization is crucial for efficient, secure, and fast containerized applications. These techniques can dramatically reduce image sizes while improving security and performance.*