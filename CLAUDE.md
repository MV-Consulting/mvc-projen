# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

`mvc-projen` is a baseline projen module for MV Consulting projects, providing scaffolding templates for AWS CDK constructs with best practices and unified setup. The project is built using [projen](https://projen.io/) and uses JSII to compile TypeScript into multiple target languages (Python, Go).

## Core Architecture

### Project Structure
- **src/projects/cdk-construct.ts**: Main class `MvcCdkConstructLibrary` that extends `AwsCdkConstructLibrary` from projen
  - Configures opinionated defaults: Node 20.x, commitlint, husky, awslint, dependabot, ESLint
  - Generates GitHub workflows, issue templates, pull request templates, and funding configuration
  - Includes `SampleCode` component that generates boilerplate code, tests, and integration tests
- **assets/**: Template files for generated projects
  - `cdk-construct/`: TypeScript templates for constructs, lambdas, tests, and integration tests
  - `common/`: Reusable GitHub templates (bug reports, feature requests, PR templates, contributing guide)
- **src/index.ts**: Exports all projects from src/projects

### Key Design Patterns
1. **Asset-based Generation**: Template files in `assets/` directory are copied into generated projects during synthesis
2. **Dynamic Configuration**: Base assets directory defaults to `${cwd()}/node_modules/@mavogel/mvc-projen/assets` but can be overridden
3. **Workflow Modification**: Post-processes GitHub workflows to inject custom build steps (awslint)
4. **Multi-language Publishing**: Uses JSII to publish to npm (JavaScript/TypeScript), PyPI (Python), and Go modules

## Common Development Commands

### Building and Testing
```bash
# Install dependencies and build project
npm run build

# Run tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run eslint

# Compile TypeScript only (without full build)
npm run compile
```

### Packaging and Publishing
```bash
# Package for all targets (npm, Python, Go)
npm run package-all

# Package individual targets
npm run package:js
npm run package:python
npm run package:go
```

### Release Management
```bash
# Create a new release (triggered by CI on main branch)
npm run release

# Bump version manually
npm run bump

# Revert version bump
npm run unbump
```

### Projen Maintenance
```bash
# Regenerate project files from .projenrc.ts
npx projen

# Remove all generated files and dependencies
npm run clobber

# Run default projen task
npm run default
```

### Using mvc-projen to Create New Projects
```bash
# Create new CDK construct project
mkdir my-new-construct && cd my-new-construct
npx projen new \
    --from @mavogel/mvc-projen@~0 \
    --cdkVersion=2.177.0 \
    --package-manager=npm
```

## Important Configuration Details

### Projen Configuration (.projenrc.ts)
- **jsiiVersion**: Currently `~5.7.0` - must stay in sync with dependencies
- **projenVersion**: Currently `0.91.8` - pinned for stability
- **Node version**: 20.x minimum
- **Commit types**: Uses conventional commits with specific allowed types (feat, fix, chore, refactor, perf, docs, style, test, build, ci)
- **Dependencies**: Both `projen` and `constructs` are listed in deps and peerDeps to ensure compatibility

### Generated Project Defaults (MvcCdkConstructLibrary)
When using `MvcCdkConstructLibrary`, projects get these defaults:
- **Copyright**: MV Consulting GmbH, 2025
- **License**: Apache-2.0
- **Node**: 20.x runtime
- **Lambda Runtime**: NODEJS_20_X
- **Package Manager**: npm
- **Auto-approve**: Configured for dependabot and bot accounts using `PROJEN_GITHUB_TOKEN` secret
- **Dependabot**: Weekly schedule, excludes aws-cdk-lib and aws-cdk from updates
- **Integration tests**: Configured for eu-west-1 and eu-west-2 regions by default
- **Build workflow**: Includes awslint step after compilation

### Git and Commits
- **Husky**: Pre-commit hooks configured via `npm run prepare`
- **Commitlint**: Enforces conventional commit messages via `.commitlintrc.js`
- **Conventional commits**: Semantic PR titles required, release notes generated from commit types
- **Releasable commits**: Only feat, fix, chore, refactor, and perf trigger releases

## Testing Strategy

### Unit Tests (test/)
- Uses Jest with ts-jest transformer
- Coverage reports in multiple formats (json, lcov, clover, cobertura, text)
- Test patterns: `**/*(*.)@(spec|test).ts?(x)` and `**/__tests__/**/*.ts?(x)`
- Configuration in package.json jest section

### Integration Tests (Generated Projects)
- Uses `@aws-cdk/integ-runner` and `@aws-cdk/integ-tests-alpha`
- Run via: `npm run integ-test`
- Tests deployed to AWS regions specified in `integTestRegions` option
- Updates snapshots on failure with `--update-on-failed`

## JSII Multi-language Support

### Publishing Targets
- **JavaScript/TypeScript**: npm registry as `@mavogel/mvc-projen`
- **Python**: PyPI as `mvc-projen` module
- **Go**: GitHub module at `github.com/MV-Consulting/mvc-projen`

### Important JSII Constraints
- All public APIs must be JSII-compatible (no TypeScript-only features)
- Use `readonly` for immutable properties
- Interface names should start with capital letter
- Enums must use PascalCase values

## Common Development Tasks

### Modifying Generated Templates
1. Edit files in `assets/cdk-construct/` or `assets/common/`
2. Run `npx projen` to regenerate
3. Run tests to verify changes: `npm test`
4. Create a test project to verify end-to-end: `npx projen new --from @mavogel/mvc-projen@~0`

### Adding New Project Types
1. Create new class in `src/projects/` extending appropriate projen base class
2. Export from `src/projects/index.ts`
3. Add corresponding assets directory if needed
4. Update tests to cover new project type
5. Document in README.md

### Updating Projen Version
1. Update `projenVersion` in `.projenrc.ts`
2. Update version in `dependencies` and `peerDependencies` arrays
3. Run `npm run clobber && npm install`
4. Run `npx projen` to regenerate with new version
5. Test thoroughly as projen updates can cause breaking changes

## Workflow Integration

### GitHub Actions Workflows
- **build.yml**: Runs on all PRs and main branch - compiles, tests, and runs awslint
- **release.yml**: Publishes to npm, PyPI, and Go on version tags
- **auto-approve.yml**: Auto-approves dependabot PRs
- **pull-request-lint.yml**: Validates PR titles follow conventional commit format

### Dependabot Configuration
- Weekly schedule for dependency updates
- Groups all dependencies except aws-cdk-lib, aws-cdk, and projen
- Auto-labeled with `dependencies` and `auto-approve`
- Ignored packages: aws-cdk-lib, aws-cdk (managed manually)

## Asset File Conventions

Generated projects receive these files from assets:
- `.github/ISSUE_TEMPLATE/bug_report.md` - Bug report template
- `.github/ISSUE_TEMPLATE/feature_request.md` - Feature request template
- `.github/pull_request_template.md` - PR checklist and structure
- `.github/FUNDING.yaml` - GitHub sponsors configuration
- `CONTRIBUTING.md` - Contribution guidelines
- `.prettierrc` - Prettier configuration (empty file, uses defaults)
- `docs/placeholder.drawio` - Placeholder architecture diagram
- Sample code in src/, test/, integ-tests/, and examples/

## Important Notes

- **Never commit changes to generated files** - Always modify `.projenrc.ts` and run `npx projen`
- **Package manager**: This project uses npm (not yarn or pnpm)
- **ESLint patterns**: Ignores `**/*-function.ts` and `examples/` directories
- **Sample code**: Automatically generated unless `sampleCode: false` in options
- **Integration test regions**: Default to eu-west-1 and eu-west-2, override with `integTestRegions`
- **Lambda runtime**: Defaults to NODEJS_20_X, no AWS SDK connection reuse in v3
