# Automatic Versioning System

Settlements uses GitHub Actions to automatically version every commit to the `main` branch based on conventional commit messages.

## How It Works

### Overview

When you push to `main`, GitHub Actions:
1.  Analyzes your commit message
2.  Determines the version bump type
3.  Updates `package.json` version
4.  Updates `CHANGELOG.md` with changes
5.  Creates a git tag (`v0.x.x`)
6.  Pushes the tag to GitHub

**Result:** Every meaningful commit gets a version automatically!

---

## Commit Message ’ Version Bump

The system uses **Conventional Commits** to determine version bumps:

### Version Bump Types

#### **MINOR** (0.x.0 ’ 0.x+1.0)
New features and breaking changes

```bash
feat: add Perlin noise terrain generation
# 0.1.0 ’ 0.2.0

feat(map): add river system
# 0.2.0 ’ 0.3.0

feat!: redesign API (breaking change)
# 0.3.0 ’ 0.4.0
```

#### **PATCH** (0.x.y ’ 0.x.y+1)
Bug fixes and performance improvements

```bash
fix: correct zoom center calculation
# 0.2.0 ’ 0.2.1

fix(render): fix border rendering bug
# 0.2.1 ’ 0.2.2

perf: optimize hex drawing
# 0.2.2 ’ 0.2.3
```

#### **NO BUMP**
Documentation, chores, refactoring

```bash
docs: update README
# No version change

chore: update dependencies
# No version change

refactor: clean up hexMath code
# No version change

style: fix formatting
# No version change

test: add unit tests
# No version change
```

---

## Conventional Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type | Bump | Description | Example |
|------|------|-------------|---------|
| `feat` | MINOR | New feature | `feat: add units` |
| `fix` | PATCH | Bug fix | `fix: zoom bug` |
| `perf` | PATCH | Performance | `perf: faster render` |
| `docs` | NONE | Documentation | `docs: update README` |
| `chore` | NONE | Maintenance | `chore: update deps` |
| `refactor` | NONE | Code refactor | `refactor: cleanup` |
| `style` | NONE | Code style | `style: format code` |
| `test` | NONE | Add tests | `test: add hex tests` |

### Scopes (Optional)

Specify what part changed:

```bash
feat(map): add Perlin noise
fix(input): correct mouse handling
docs(readme): add examples
```

Common scopes:
- `map` - Map system
- `render` - Rendering
- `input` - Input handling
- `core` - Core utilities
- `game` - Game logic

---

## Examples

### Example 1: Adding a Feature

```bash
# Commit
git commit -m "feat: add Perlin noise terrain generation

Implemented Perlin noise algorithm for natural-looking terrain.
- Add PerlinNoise class
- Update MapGenerator
- Add seed support"

# Push
git push origin main

# Automatic Result:
#  Version: 0.1.0 ’ 0.2.0
#  Tag: v0.2.0 created
#  CHANGELOG.md updated
#  package.json updated
```

### Example 2: Fixing a Bug

```bash
# Commit
git commit -m "fix(input): correct zoom center calculation

Mouse wheel zoom now properly centers on cursor position.
Fixes #42"

# Push
git push origin main

# Automatic Result:
#  Version: 0.2.0 ’ 0.2.1
#  Tag: v0.2.1 created
#  CHANGELOG.md updated
#  package.json updated
```

### Example 3: Documentation Update

```bash
# Commit
git commit -m "docs: update installation instructions"

# Push
git push origin main

# Automatic Result:
#   No version bump (docs don't need versioning)
#  Commit pushed
#   No tag created
```

---

## Version Numbering

### Pre-release (0.x.x)

Currently in **alpha/beta** (version 0.x.x):

```
0.1.0 ’ 0.2.0 (feat: new feature)
0.2.0 ’ 0.2.1 (fix: bug fix)
0.2.1 ’ 0.3.0 (feat: another feature)
```

**Note:** In 0.x.x versions:
- `feat` ’ Minor bump (0.x.0 ’ 0.x+1.0)
- `fix`/`perf` ’ Patch bump (0.x.y ’ 0.x.y+1)
- Breaking changes still bump minor (0.x.x ’ 0.x+1.0)

### Stable Release (1.x.x)

When ready for v1.0.0, manually create:

```bash
# Update to 1.0.0
npm version major
git push origin main v1.0.0
```

**After 1.0.0:**
- `feat` ’ Minor bump (1.0.0 ’ 1.1.0)
- `fix`/`perf` ’ Patch bump (1.1.0 ’ 1.1.1)
- `feat!` ’ Major bump (1.1.1 ’ 2.0.0)

---

## Workflow File

Location: `.github/workflows/auto-version.yml`

### What It Does

1. **Triggers** on push to `main`
2. **Analyzes** commit message
3. **Bumps version** in package.json
4. **Updates CHANGELOG.md**
5. **Creates git tag**
6. **Pushes** tag to GitHub
7. **Skips** if commit is a version bump (prevents infinite loop)

### Special Features

**Infinite Loop Prevention:**
- Skips commits starting with `chore(release):`
- Uses `[skip ci]` in version bump commits

**Smart Bumping:**
- Parses conventional commit format
- Determines appropriate bump type
- Handles 0.x.x versions differently from 1.x.x+

**Automatic Changelog:**
- Adds entry to CHANGELOG.md
- Includes commit hash
- Categorizes by type (Added, Fixed, Changed)

---

## Viewing Versions

### On GitHub

**Releases:**
https://github.com/rossus/settlements/releases

**Tags:**
https://github.com/rossus/settlements/tags

**Commits:**
https://github.com/rossus/settlements/commits/main

### Locally

```bash
# View all tags
git tag -l

# View latest version
node -p "require('./package.json').version"

# View version history
git log --oneline --decorate --graph

# View specific version
git show v0.2.0
```

---

## Manual Version Override

If you need to manually set a version:

```bash
# Update package.json manually
# Edit: "version": "0.5.0"

# Commit with special message
git add package.json
git commit -m "chore(release): bump version to 0.5.0 [skip ci]"

# Create tag
git tag -a v0.5.0 -m "Version 0.5.0"

# Push
git push origin main v0.5.0
```

**Note:** Use `[skip ci]` to prevent the workflow from running.

---

## Troubleshooting

### Version not bumping?

**Check commit message:**
```bash
# L Wrong
git commit -m "added new feature"

#  Correct
git commit -m "feat: add new feature"
```

### Multiple commits at once?

Each commit is versioned separately:
```bash
# Commit 1
git commit -m "feat: add units"    # 0.1.0 ’ 0.2.0

# Commit 2
git commit -m "fix: fix units bug" # 0.2.0 ’ 0.2.1

# Push both
git push origin main
# Result: Two version bumps!
```

### Want to skip versioning?

Use `docs`, `chore`, `refactor`, `style`, or `test`:
```bash
git commit -m "docs: update README"  # No version bump
```

### Workflow not running?

1. Check GitHub Actions tab
2. Ensure workflow file is in `.github/workflows/`
3. Check permissions (needs `contents: write`)
4. View logs for errors

---

## Best Practices

###  DO

- Use conventional commit messages
- Be specific in commit subjects
- Reference issues when fixing bugs
- Commit often with atomic changes

```bash
# Good commits
feat(map): add Perlin noise generation
fix(input): correct zoom center calculation (fixes #42)
perf(render): optimize border drawing by 60%
```

### L DON'T

- Use vague commit messages
- Mix multiple changes in one commit
- Commit without proper type prefix

```bash
# Bad commits
git commit -m "updates"
git commit -m "fixed stuff"
git commit -m "wip"
```

---

## Benefits

### Automatic

-  No manual version bumping
-  No forgetting to tag
-  Consistent versioning
-  Automatic changelog

### Traceable

-  Every version has a commit
-  Every version has a tag
-  Clear version history
-  Easy to rollback

### Professional

-  Semantic versioning
-  Conventional commits
-  Automated workflow
-  GitHub releases ready

---

## Future Enhancements

### Planned Additions

**Release Notes:**
- Automatically create GitHub releases
- Generate release notes from commits
- Attach build artifacts

**Notifications:**
- Slack/Discord notifications
- Email on new releases
- Twitter announcements

**Advanced Versioning:**
- Pre-release versions (alpha, beta, rc)
- Branch-specific versioning
- Milestone tracking

---

## Summary

### Quick Reference

```bash
# New feature ’ 0.x.0 ’ 0.x+1.0
git commit -m "feat: add feature"

# Bug fix ’ 0.x.y ’ 0.x.y+1
git commit -m "fix: fix bug"

# Performance ’ 0.x.y ’ 0.x.y+1
git commit -m "perf: optimize code"

# No version change
git commit -m "docs: update docs"
git commit -m "chore: cleanup"
git commit -m "refactor: improve code"
```

### Version Flow

```
Code ’ Commit (feat/fix) ’ Push ’ GitHub Actions ’
Version Bump ’ Tag Created ’ Changelog Updated ’
Tag Pushed ’ Done!
```

**Everything automatic!** =€

---

## Links

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Your commits are now automatically versioned!** Every `feat` and `fix` gets a version number. <‰
