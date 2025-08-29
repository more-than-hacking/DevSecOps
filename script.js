// Docker Learning Hub - Content Management
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const contentBtns = document.querySelectorAll('.content-btn');
    const pathItems = document.querySelectorAll('.path-item');

    // Navigation functionality
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            // Load default content for the section
            if (targetSection !== 'home') {
                loadDefaultContent(targetSection);
            }
        });
    });

    // Learning path items
    pathItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelector(`[data-section="${targetSection}"]`).classList.add('active');
            
            // Show target section
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            // Load default content
            loadDefaultContent(targetSection);
        });
    });

    // Content navigation buttons
    contentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.closest('.content-section').id;
            const file = this.getAttribute('data-file');
            
            // Update active button
            this.closest('.content-nav').querySelectorAll('.content-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Load content
            loadContent(section, file);
        });
    });

    // Load default content for each section
    function loadDefaultContent(section) {
        const defaultFile = getDefaultFile(section);
        if (defaultFile) {
            loadContent(section, defaultFile);
        }
    }

    // Get default file for each section
    function getDefaultFile(section) {
        const defaults = {
            'history': 'evolution',
            'basics': 'what-is-docker',
            'advanced': 'multi-stage',
            'security': 'security-fundamentals',
            'practical': 'hello-world'
        };
        return defaults[section];
    }

    // Load content from content files
    function loadContent(section, file) {
        const contentDiv = document.getElementById(`${section}-content`);
        if (!contentDiv) return;

        // Try to load from content files
        const filePath = `content/${section}/${file}.md`;
        
        fetch(filePath)
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    // If file not found, show placeholder content
                    return getPlaceholderContent(section, file);
                }
            })
            .then(content => {
                // Convert Markdown to HTML using marked.js
                contentDiv.innerHTML = marked.parse(content);
            })
            .catch(error => {
                console.log('Loading placeholder content:', error);
                contentDiv.innerHTML = getPlaceholderContent(section, file);
            });
    }

    // Placeholder content when files aren't accessible
    function getPlaceholderContent(section, file) {
        const placeholders = {
            'history': {
                'evolution': `
                    <h1>📚 Evolution of Containerization</h1>
                    <p>This section will cover the complete history of how containers evolved from mainframes to modern cloud-native applications.</p>
                    <h2>Key Topics:</h2>
                    <ul>
                        <li>Mainframe era and virtualization</li>
                        <li>Unix chroot and process isolation</li>
                        <li>Solaris Zones and FreeBSD Jails</li>
                        <li>LXC (Linux Containers)</li>
                        <li>Docker's revolutionary approach</li>
                    </ul>
                    <p><em>Content will be loaded from: content/history/evolution.md</em></p>
                `,
                'why-containers': `
                    <h1>🤔 Why Containers?</h1>
                    <p>Understanding the fundamental problems containers solve and why they're essential in modern software development.</p>
                    <h2>Problems Solved:</h2>
                    <ul>
                        <li>Environment consistency</li>
                        <li>Deployment reliability</li>
                        <li>Resource efficiency</li>
                        <li>Scalability challenges</li>
                        <li>Development workflow</li>
                    </ul>
                `,
                'before-containers': `
                    <h1>⏰ Before Containers</h1>
                    <p>How software was deployed and managed before the container revolution.</p>
                `,
                'docker-story': `
                    <h1>🐳 The Docker Story</h1>
                    <p>How Docker changed the game and became the de facto standard for containerization.</p>
                `
            },
            'basics': {
                'what-is-docker': `
                    <h1>🔰 What is Docker?</h1>
                    <p>Docker is a platform for developing, shipping, and running applications in containers.</p>
                    <h2>Core Concepts:</h2>
                    <ul>
                        <li>Containerization technology</li>
                        <li>Application packaging</li>
                        <li>Platform independence</li>
                        <li>Resource isolation</li>
                    </ul>
                `,
                'containers-vs-vms': `
                    <h1>⚖️ Containers vs Virtual Machines</h1>
                    <p>Understanding the key differences and when to use each approach.</p>
                `,
                'images-containers': `
                    <h1>🖼️ Images & Containers</h1>
                    <p>The relationship between Docker images and running containers.</p>
                `,
                'docker-architecture': `
                    <h1>🏗️ Docker Architecture</h1>
                    <p>How Docker works under the hood.</p>
                `,
                'basic-commands': `
                    <h1>⌨️ Basic Docker Commands</h1>
                    <p>Essential commands to get started with Docker.</p>
                `
            },
            'advanced': {
                'multi-stage': `
                    <h1>🚀 Multi-Stage Builds</h1>
                    <p>Advanced techniques for creating optimized Docker images.</p>
                `,
                'docker-compose': `
                    <h1>🎼 Docker Compose</h1>
                    <p>Orchestrating multi-container applications.</p>
                `,
                'networking': `
                    <h1>🌐 Docker Networking</h1>
                    <p>Understanding container networking and communication.</p>
                `,
                'volumes': `
                    <h1>💾 Volumes & Storage</h1>
                    <p>Managing persistent data in containers.</p>
                `,
                'optimization': `
                    <h1>⚡ Image Optimization</h1>
                    <p>Techniques for creating smaller, faster Docker images.</p>
                `
            },
            'security': {
                'security-fundamentals': `
                    <h1>🛡️ Container Security Fundamentals</h1>
                    <p>Essential security concepts for containerized applications.</p>
                    <h2>Key Areas:</h2>
                    <ul>
                        <li>Container isolation</li>
                        <li>Image security</li>
                        <li>Runtime protection</li>
                        <li>Access control</li>
                        <li>Vulnerability management</li>
                    </ul>
                `,
                'vulnerability-scanning': `
                    <h1>🔍 Vulnerability Scanning</h1>
                    <p>Tools and techniques for finding security issues in containers.</p>
                `,
                'runtime-security': `
                    <h1>🔄 Runtime Security</h1>
                    <p>Protecting containers while they're running.</p>
                `,
                'best-practices': `
                    <h1>✅ Security Best Practices</h1>
                    <p>Proven strategies for secure container deployments.</p>
                `,
                'compliance': `
                    <h1>📋 Compliance & Governance</h1>
                    <p>Meeting regulatory and organizational security requirements.</p>
                `
            },
            'practical': {
                'hello-world': `
                    <h1>💻 Hello World Container</h1>
                    <p>Your first Docker container - step by step.</p>
                `,
                'web-app': `
                    <h1>🌐 Web Application Container</h1>
                    <p>Containerizing a real web application.</p>
                `,
                'database': `
                    <h1>🗄️ Database Container</h1>
                    <p>Running databases in containers.</p>
                `,
                'multi-service': `
                    <h1>🔗 Multi-Service Application</h1>
                    <p>Complex applications with multiple containers.</p>
                `,
                'production': `
                    <h1>🚀 Production Deployment</h1>
                    <p>Best practices for production container deployments.</p>
                `
            }
        };

        return placeholders[section]?.[file] || `
            <h1>${file}</h1>
            <p>Content for this section will be loaded from your Markdown files.</p>
            <p><em>Expected file: content/${section}/${file}.md</em></p>
        `;
    }
}); 