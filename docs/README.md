# Settlements Documentation

Complete documentation for the Settlements hexagonal grid-based strategy game.

## 📚 Documentation Index

### 📖 Guides

**User and developer guides for working with the project:**

- **[Auto Versioning Guide](guides/auto-versioning.md)** - Automatic semantic versioning system
  - How automatic versioning works
  - Conventional commit format
  - Examples and troubleshooting

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

### 🏗️ Architecture

**Technical documentation about project structure:**

- **[Folder Structure](architecture/folder-structure.md)** - Project organization
  - Complete directory tree
  - Organization principles
  - Dependency graph
  - Adding new features

### 📜 History

**Historical documentation from the refactoring process:**

- **[Refactoring Complete](history/refactoring-complete.md)** - Complete refactoring overview
  - Full summary of all refactoring steps
  - Before/after comparison
  - Benefits achieved

- [Refactoring Plan](history/refactoring-plan.md) - Original refactoring plan
- [Refactoring Step 4](history/refactoring-step4.md) - MapRenderer extraction
- [Refactoring Step 5](history/refactoring-step5.md) - HexMap & MapGenerator extraction
- [Refactoring Summary](history/refactoring-summary.md) - Interim summary

---

## 🚀 Quick Start

### For Users

1. **Getting Started:** See main [README.md](../README.md)
2. **Controls:** Main README has full control reference
3. **World Sizes:** Main README lists all available sizes

### For Developers

1. **Setup Git:** Read [Git Workflow Guide](guides/git-workflow.md)
2. **Understand Structure:** Read [Folder Structure](architecture/folder-structure.md)
3. **Learn Versioning:** Read [Auto Versioning Guide](guides/auto-versioning.md)
4. **Reuse Code:** Read [Code Reusability Guide](guides/code-reusability.md)

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
│   ├── auto-versioning.md             # Automatic versioning system
│   ├── code-reusability.md            # Reusing code elsewhere
│   └── git-workflow.md                # Version control guide
│
├── architecture/                      # Technical architecture
│   └── folder-structure.md            # Project organization
│
└── history/                           # Refactoring history
    ├── refactoring-complete.md        # Complete overview
    ├── refactoring-plan.md            # Original plan
    ├── refactoring-step4.md           # Step 4 details
    ├── refactoring-step5.md           # Step 5 details
    └── refactoring-summary.md         # Interim summary
```

---

## 🎯 Documentation by Topic

### Version Control & Releases

- [Git Workflow Guide](guides/git-workflow.md) - Complete Git workflow
- [Auto Versioning Guide](guides/auto-versioning.md) - Automatic versioning

### Code Organization

- [Folder Structure](architecture/folder-structure.md) - How code is organized
- [Refactoring Complete](history/refactoring-complete.md) - How we got here

### Code Reuse

- [Code Reusability Guide](guides/code-reusability.md) - Using code elsewhere
- See also: [examples/](../examples/) folder for working demos

### Project History

- [Refactoring Complete](history/refactoring-complete.md) - Full story
- All files in [history/](history/) folder

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
   - **history/** - Historical records

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

**...understand the project structure**
→ [Folder Structure](architecture/folder-structure.md)

**...contribute to the project**
→ [Git Workflow Guide](guides/git-workflow.md)

**...reuse hexMath in my project**
→ [Code Reusability Guide](guides/code-reusability.md)

**...understand version numbers**
→ [Auto Versioning Guide](guides/auto-versioning.md)

**...learn how the refactoring was done**
→ [Refactoring Complete](history/refactoring-complete.md)

**...create a pull request**
→ [Git Workflow Guide](guides/git-workflow.md) (sections on PRs)

**...report a bug**
→ [GitHub Issues](https://github.com/rossus/settlements/issues)

---

## 📊 Documentation Stats

- **Total Docs:** 9 files
- **Guides:** 3 files
- **Architecture:** 1 file
- **History:** 5 files
- **Total Size:** ~90 KB
- **Last Updated:** 2025-11-16

---

## ✨ Recent Updates

- **2025-11-16:** Updated documentation to reflect layered terrain system and constraint-based validation
- **2025-11-16:** Updated CHANGELOG with recent terrain system improvements
- **2025-11-14:** Reorganized docs into guides/architecture/history
- **2025-11-14:** Added auto-versioning guide
- **2025-11-14:** Added code reusability guide
- **2025-11-14:** Created folder structure documentation

---

**Need help?** Open an [issue](https://github.com/rossus/settlements/issues) or check the main [README](../README.md)!
