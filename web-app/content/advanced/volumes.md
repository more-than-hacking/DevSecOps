# 💾 Volumes & Storage: Data Persistence in Docker

## 🎯 Understanding Docker Storage

By default, all files created inside a container are stored in a writable container layer that disappears when the container is removed. Docker provides several ways to persist data beyond the container lifecycle: volumes, bind mounts, and tmpfs mounts.

## 🗄️ Types of Docker Storage

### **Storage Architecture Overview**
```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┤
│  │                Container                                │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   tmpfs     │  │   Volume    │  │ Bind Mount  │    │
│  │  │   Mount     │  │   Mount     │  │             │    │
│  │  │ (Memory)    │  │(/app/data)  │  │(/host/data) │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
│                           │             │                  │
│                           ▼             ▼                  │
│  ┌─────────────────────────────────────────────────────────┤
│  │                Host Filesystem                          │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  │   Memory    │  │/var/lib/    │  │/host/path/  │    │
│  │  │   (tmpfs)   │  │docker/      │  │data/        │    │
│  │  │             │  │volumes/     │  │             │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

## 📁 Docker Volumes

### **What are Docker Volumes?**
Volumes are the preferred mechanism for persisting data generated and used by Docker containers. They are managed by Docker and stored in `/var/lib/docker/volumes/` on the host.

### **Volume Advantages**
```bash
# Benefits of volumes:
- Managed by Docker
- Can be shared among containers
- Work on both Linux and Windows
- Can be safely backed up or migrated
- Can be pre-populated with data
- Support volume drivers for remote storage
```

### **Creating and Managing Volumes**

#### **Basic Volume Operations**
```bash
# Create a named volume
docker volume create my-volume

# List all volumes
docker volume ls

# Inspect volume details
docker volume inspect my-volume

# Remove a volume
docker volume rm my-volume

# Remove all unused volumes
docker volume prune
```

#### **Using Volumes with Containers**
```bash
# Run container with named volume
docker run -d \
  --name web \
  -v my-volume:/app/data \
  nginx:latest

# Run container with anonymous volume
docker run -d \
  --name web \
  -v /app/data \
  nginx:latest

# Using --mount syntax (recommended)
docker run -d \
  --name web \
  --mount source=my-volume,target=/app/data \
  nginx:latest
```

### **Volume Configuration Options**

#### **Volume Drivers**
```bash
# Create volume with specific driver
docker volume create \
  --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.100,rw \
  --opt device=:/path/to/dir \
  nfs-volume

# Create volume with device mapping
docker volume create \
  --driver local \
  --opt type=none \
  --opt o=bind \
  --opt device=/host/path \
  bind-volume
```

#### **Volume Labels and Metadata**
```bash
# Create volume with labels
docker volume create \
  --label environment=production \
  --label backup=daily \
  prod-data

# Filter volumes by label
docker volume ls --filter label=environment=production
```

### **Volume Backup and Restore**

#### **Backing Up Volumes**
```bash
# Backup volume to tar file
docker run --rm \
  -v my-volume:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/volume-backup.tar.gz -C /data .

# Backup with timestamp
docker run --rm \
  -v my-volume:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/volume-backup-$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

#### **Restoring Volumes**
```bash
# Restore volume from backup
docker run --rm \
  -v my-volume:/data \
  -v $(pwd):/backup \
  alpine \
  tar xzf /backup/volume-backup.tar.gz -C /data
```

## 🔗 Bind Mounts

### **What are Bind Mounts?**
Bind mounts directly mount a file or directory from the host machine into the container. The file or directory is referenced by its absolute path on the host.

### **Using Bind Mounts**

#### **Basic Bind Mount Usage**
```bash
# Mount host directory to container
docker run -d \
  --name web \
  -v /host/path:/container/path \
  nginx:latest

# Mount with read-only access
docker run -d \
  --name web \
  -v /host/path:/container/path:ro \
  nginx:latest

# Using --mount syntax
docker run -d \
  --name web \
  --mount type=bind,source=/host/path,target=/container/path \
  nginx:latest
```

#### **Bind Mount Options**
```bash
# Read-only bind mount
docker run -d \
  --mount type=bind,source=/host/data,target=/app/data,readonly \
  myapp:latest

# Bind mount with propagation
docker run -d \
  --mount type=bind,source=/host/data,target=/app/data,bind-propagation=shared \
  myapp:latest
```

### **Development Workflows with Bind Mounts**

#### **Live Code Reloading**
```bash
# Mount source code for development
docker run -d \
  --name dev-app \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/package.json:/app/package.json \
  -p 3000:3000 \
  node:16 \
  npm run dev

# Changes to source code reflect immediately in container
```

#### **Configuration Management**
```bash
# Mount configuration files
docker run -d \
  --name nginx \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/ssl:/etc/nginx/ssl:ro \
  -p 80:80 -p 443:443 \
  nginx:latest
```

## 💨 tmpfs Mounts

### **What are tmpfs Mounts?**
tmpfs mounts store data in the host system's memory only. When the container stops, the tmpfs mount is removed, and files written there won't be persisted.

### **Using tmpfs Mounts**

#### **Basic tmpfs Usage**
```bash
# Create tmpfs mount
docker run -d \
  --name app \
  --tmpfs /app/temp \
  myapp:latest

# Using --mount syntax with options
docker run -d \
  --name app \
  --mount type=tmpfs,destination=/app/temp,tmpfs-size=100m \
  myapp:latest
```

#### **tmpfs Use Cases**
```bash
# Temporary file processing
docker run --rm \
  --tmpfs /tmp:noexec,nosuid,size=100m \
  processing-app

# Security-sensitive operations
docker run --rm \
  --tmpfs /secrets:noexec,nosuid,size=10m \
  security-app
```

## 🐳 Docker Compose Storage

### **Volume Definitions in Compose**

#### **Named Volumes**
```yaml
version: '3.8'

services:
  database:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  web:
    image: nginx:latest
    volumes:
      - static_files:/usr/share/nginx/html

volumes:
  postgres_data:
    driver: local
  static_files:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /host/static
```

#### **Bind Mounts in Compose**
```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    volumes:
      - ./html:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /var/log/nginx:/var/log/nginx

  app:
    build: .
    volumes:
      - .:/app
      - /app/node_modules  # Anonymous volume to prevent overwrite
    working_dir: /app
    command: npm run dev
```

#### **External Volumes**
```yaml
version: '3.8'

services:
  database:
    image: postgres:13
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
    external: true
    name: production_db_data
```

## 🔧 Advanced Storage Patterns

### **1. Multi-Container Data Sharing**

#### **Shared Volume Pattern**
```yaml
version: '3.8'

services:
  # Data generator
  producer:
    image: myapp:producer
    volumes:
      - shared_data:/app/output
    command: python generate_data.py

  # Data consumer
  consumer:
    image: myapp:consumer
    volumes:
      - shared_data:/app/input
    depends_on:
      - producer
    command: python process_data.py

volumes:
  shared_data:
```

#### **Data Container Pattern**
```bash
# Create data-only container
docker create \
  --name data-container \
  -v /data \
  alpine

# Use data from data container
docker run -d \
  --name app1 \
  --volumes-from data-container \
  myapp:latest

docker run -d \
  --name app2 \
  --volumes-from data-container \
  myapp:latest
```

### **2. Database Storage Patterns**

#### **PostgreSQL with Persistent Storage**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
      - ./backups:/backups
    ports:
      - "5432:5432"

volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/postgresql-data
```

#### **MySQL with Configuration**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myapp
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql.cnf:/etc/mysql/conf.d/mysql.cnf:ro
      - ./mysql-logs:/var/log/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

### **3. Log Management**

#### **Centralized Logging**
```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - logs:/var/log/nginx
    ports:
      - "80:80"

  app:
    image: myapp:latest
    volumes:
      - logs:/app/logs

  logrotate:
    image: logrotate:latest
    volumes:
      - logs:/logs
    command: logrotate -f /etc/logrotate.conf

volumes:
  logs:
```

## 📊 Storage Performance Optimization

### **1. Volume Performance**

#### **Storage Driver Selection**
```bash
# Check current storage driver
docker info | grep "Storage Driver"

# Different drivers have different performance characteristics:
# - overlay2: Best for most use cases
# - devicemapper: Good for production, complex setup
# - aufs: Deprecated, avoid
# - btrfs: Good for copy-on-write workloads
```

#### **Volume Performance Tips**
```bash
# Use local volumes for best performance
docker volume create --driver local fast-volume

# Use SSD storage for database volumes
docker volume create \
  --driver local \
  --opt type=none \
  --opt o=bind \
  --opt device=/ssd/path \
  ssd-volume

# Avoid bind mounts for high I/O workloads in production
```

### **2. Memory-Based Storage**

#### **tmpfs for High-Performance Temporary Storage**
```bash
# Use tmpfs for temporary high-I/O operations
docker run -d \
  --name cache-app \
  --tmpfs /cache:rw,size=1g,mode=1777 \
  myapp:latest
```

#### **RAM Disk Volumes**
```bash
# Create RAM disk volume
docker volume create \
  --driver local \
  --opt type=tmpfs \
  --opt device=tmpfs \
  --opt o=size=1g \
  ram-volume
```

## 🔒 Storage Security

### **1. Volume Security**

#### **Access Control**
```bash
# Create volume with specific ownership
docker run --rm \
  -v my-volume:/data \
  alpine \
  chown -R 1000:1000 /data

# Run container with specific user
docker run -d \
  --name app \
  --user 1000:1000 \
  -v my-volume:/app/data \
  myapp:latest
```

#### **Read-Only Volumes**
```bash
# Mount volume as read-only
docker run -d \
  --name app \
  -v config-volume:/app/config:ro \
  myapp:latest

# Compose example
version: '3.8'
services:
  app:
    image: myapp:latest
    volumes:
      - config_data:/app/config:ro
      - secrets:/run/secrets:ro,mode=400

volumes:
  config_data:
  secrets:
```

### **2. Encryption**

#### **Encrypted Volumes**
```bash
# Create encrypted volume using LUKS
docker volume create \
  --driver local \
  --opt type=ext4 \
  --opt device=/dev/mapper/encrypted-volume \
  encrypted-volume

# Use encrypted storage for sensitive data
docker run -d \
  --name secure-app \
  -v encrypted-volume:/secure/data \
  myapp:latest
```

## 🔍 Storage Monitoring and Troubleshooting

### **1. Volume Inspection**

#### **Volume Usage**
```bash
# Check volume usage
docker system df -v

# Inspect specific volume
docker volume inspect my-volume

# List volume contents
docker run --rm \
  -v my-volume:/data \
  alpine \
  ls -la /data
```

#### **Container Storage Usage**
```bash
# Check container disk usage
docker exec container_name df -h

# Check specific directory usage
docker exec container_name du -sh /app/data

# Monitor real-time I/O
docker exec container_name iostat -x 1
```

### **2. Common Storage Issues**

#### **Volume Mount Issues**
```bash
# Check if volume is properly mounted
docker inspect container_name | grep -A 10 "Mounts"

# Verify volume exists
docker volume ls | grep volume_name

# Check volume permissions
docker exec container_name ls -la /mount/point
```

#### **Disk Space Issues**
```bash
# Clean up unused volumes
docker volume prune

# Clean up everything
docker system prune -a --volumes

# Check Docker disk usage
docker system df
```

## 🎯 Storage Best Practices

### **1. Volume Management**
- **Use named volumes** for persistent data
- **Use bind mounts** for configuration and development
- **Use tmpfs** for temporary, sensitive data
- **Regular backups** of important volumes

### **2. Performance**
- **Choose appropriate storage drivers**
- **Use local storage** for best performance
- **Avoid nested volumes** when possible
- **Monitor disk I/O** and optimize accordingly

### **3. Security**
- **Use read-only mounts** when possible
- **Set proper file permissions**
- **Encrypt sensitive data volumes**
- **Regular security audits** of volume access

## 🚀 Next Steps

Now that you understand Docker storage, let's explore:

1. **Image Optimization** - Performance techniques
2. **Security A-Z** - Complete security guide
3. **Practical Examples** - Hands-on containerization
4. **Production Deployment** - Best practices

---

*Proper storage management is crucial for data persistence, performance, and security in containerized applications. Understanding these concepts enables you to design robust data architectures.*