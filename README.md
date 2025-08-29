# DevSecOps Learning Hub - Web Application 🚀

A beautiful, interactive web application for learning DevSecOps concepts with Docker, Kubernetes, and ArgoCD.

## Features ✨

- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Interactive Learning**: Click on examples to read detailed content
- **Progressive Learning**: Structured learning path from beginner to advanced
- **Mobile Responsive**: Works perfectly on all devices
- **No Dependencies**: Pure HTML, CSS, and JavaScript

## Quick Start 🚀

### Option 1: Python HTTP Server (Recommended)
```bash
cd web-app
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Option 2: Node.js HTTP Server
```bash
cd web-app
npx http-server -p 8000
# Open http://localhost:8000 in your browser
```

### Option 3: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Project Structure 📁

```
web-app/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── package.json        # Project configuration
└── README.md           # This file
```

## Learning Path 📚

### Phase 1: Docker Fundamentals 🐳
- Hello World Container
- Web Application Container
- Multi-Stage Builds
- Docker Compose
- Security Best Practices

### Phase 2: Kubernetes Fundamentals ☸️
- Local Kubernetes Setup
- Application Management
- Networking & Services
- Storage & Volumes
- Security & RBAC

### Phase 3: GitOps with ArgoCD 🔄
- Installation & Setup
- Application Management
- Multi-Environment
- Security & Compliance
- Monitoring & Alerting

## How to Use 🎯

1. **Navigate**: Use the top navigation to jump between sections
2. **Explore**: Click on example cards to read detailed content
3. **Learn**: Follow the progressive learning path
4. **Practice**: Use the examples to build your own applications

## Customization 🎨

### Adding New Examples
1. Add new content to `contentData` in `script.js`
2. Create corresponding HTML cards in `index.html`
3. Style new elements in `styles.css`

### Changing Colors
Modify CSS variables in `:root` section of `styles.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #7c3aed;
    /* ... other colors */
}
```

### Adding New Sections
1. Add new section HTML in `index.html`
2. Add navigation link
3. Style the new section in `styles.css`

## Browser Support 🌐

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License 📄

MIT License - feel free to use this for your own learning projects!

## Support 💬

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions and share experiences
- **Contributions**: Submit improvements and examples

---

## Ready to Learn? 🎯

Start your DevSecOps journey today! Open the web application and begin with Docker fundamentals.

**Happy Learning! 🚀** 