# Settlements Documentation

Complete documentation for the Settlements hexagonal grid-based strategy game.

## 📚 Documentation Index

### 📖 Guides

**User and developer guides for working with the project:**

- **[Extending Terrain System](guides/extending-terrain.md)** - How to add new layers and terrain types
  - Understanding the layered system
  - Adding new types to existing layers
  - Adding completely new layers
  - Constraint system reference
  - Testing and examples

- **[Code Reusability Guide](guides/code-reusability.md)** - Reusing code in other projects
  - What's reusable now
  - How to convert to libraries
  - ES6 modules and npm packages
  - Practical examples

- **[Git Workflow Guide](guides/git-workflow.md)** - Version control and collaboration
  - Branching strategy (Git Flow)
  - Commit message guidelines
  - Release process
  - Best practices

- **[Auto Versioning Guide](guides/auto-versioning.md)** - Automatic semantic versioning system
  - How automatic versioning works
  - Conventional commit format
  - Examples and troubleshooting

### 🏗️ Architecture

**Technical documentation about project structure:**

- **[Folder Structure](architecture/folder-structure.md)** - Project organization
  - Complete directory tree
  - Organization principles
  - Dependency graph
  - Adding new features

---

## 🚀 Quick Start

### For Users

1. **Getting Started:** See main [README.md](../README.md)
2. **Controls:** Main README has full control reference
3. **World Sizes:** Main README lists all available sizes

### For Developers

1. **Setup Git:** Read [Git Workflow Guide](guides/git-workflow.md)
2. **Understand Structure:** Read [Folder Structure](architecture/folder-structure.md)
3. **Extend Terrain:** Read [Extending Terrain System](guides/extending-terrain.md)
4. **Learn Versioning:** Read [Auto Versioning Guide](guides/auto-versioning.md)

### For Contributors

1. **Fork** the repository
2. **Read** [Git Workflow Guide](guides/git-workflow.md)
3. **Follow** conventional commits (see [Auto Versioning](guides/auto-versioning.md))
4. **Create** pull request

---

## 📂 Documentation Structure

```
docs/
├── README.md                          # This file - documentation index
│
├── guides/                            # User/developer guides
│   ├── extending-terrain.md           # How to add layers and types
│   ├── code-reusability.md            # Reusing code elsewhere
│   ├── git-workflow.md                # Version control guide
│   └── auto-versioning.md             # Automatic versioning system
│
└── architecture/                      # Technical architecture
    └── folder-structure.md            # Project organization
```

---

## 🎯 Documentation by Topic

### Extending the Game

- [Extending Terrain System](guides/extending-terrain.md) - Add new layers and terrain types
- [Folder Structure](architecture/folder-structure.md) - Add new modules and features

### Version Control & Releases

- [Git Workflow Guide](guides/git-workflow.md) - Complete Git workflow
- [Auto Versioning Guide](guides/auto-versioning.md) - Automatic versioning

### Code Organization

- [Folder Structure](architecture/folder-structure.md) - How code is organized

### Code Reuse

- [Code Reusability Guide](guides/code-reusability.md) - Using code elsewhere
- See also: [examples/](../examples/) folder for working demos

---

## 🔗 External Resources

### Tools & Technologies

- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message format
- [Semantic Versioning](https://semver.org/) - Version numbering
- [Keep a Changelog](https://keepachangelog.com/) - Changelog format
- [GitHub Flow](https://guides.github.com/introduction/flow/) - Git workflow

### Hexagonal Grids

- [Red Blob Games - Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/) - Math reference
- [Amit's Game Programming](http://theory.stanford.edu/~amitp/GameProgramming/) - Pathfinding

### JavaScript & Canvas

- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [JavaScript.info](https://javascript.info/) - Modern JavaScript

---

## 📝 Contributing to Documentation

### Adding New Documentation

1. Determine category:
   - **guides/** - User/developer guides
   - **architecture/** - Technical docs

2. Create file:
   ```bash
   touch docs/guides/new-guide.md
   ```

3. Update this README:
   - Add to relevant section
   - Update structure diagram

4. Commit with conventional format:
   ```bash
   git commit -m "docs(guides): add new guide"
   ```

### Documentation Standards

- ✅ Use Markdown format
- ✅ Include table of contents for long docs
- ✅ Add code examples
- ✅ Use clear headings
- ✅ Link to related docs
- ✅ Keep language simple and clear

---

## 🔍 Finding What You Need

### I want to...

**...add a new terrain type**
→ [Extending Terrain System](guides/extending-terrain.md)

**...add a new layer (like moisture)**
→ [Extending Terrain System](guides/extending-terrain.md)

**...understand the project structure**
→ [Folder Structure](architecture/folder-structure.md)

**...contribute to the project**
→ [Git Workflow Guide](guides/git-workflow.md)

**...reuse hexMath in my project**
→ [Code Reusability Guide](guides/code-reusability.md)

**...understand version numbers**
→ [Auto Versioning Guide](guides/auto-versioning.md)

**...create a pull request**
→ [Git Workflow Guide](guides/git-workflow.md) (sections on PRs)

**...report a bug**
→ [GitHub Issues](https://github.com/rossus/settlements/issues)

---

## 📊 Documentation Stats

- **Total Docs:** 6 files
- **Guides:** 4 files
- **Architecture:** 1 file
- **Last Updated:** 2025-11-16

---

## ✨ Recent Updates

- **2025-11-16:** Added comprehensive guide for extending terrain system
- **2025-11-16:** Removed outdated refactoring history documentation
- **2025-11-16:** Updated all docs to reflect layered terrain system and constraint-based validation
- **2025-11-14:** Reorganized docs into guides/architecture structure
- **2025-11-14:** Added auto-versioning and code reusability guides

---

**Need help?** Open an [issue](https://github.com/rossus/settlements/issues) or check the main [README](../README.md)!
