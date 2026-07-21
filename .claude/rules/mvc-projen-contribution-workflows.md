# Contribution Workflows

**Last Updated:** 2026-07-21

## Modifying Generated Templates

Templates in `assets/cdk-construct/` and `assets/common/` are copied verbatim into scaffolded projects (see `mvc-projen-project.md` → Architecture Notes, pattern 1) — editing them has no effect until re-synthesized.

1. Edit files in `assets/cdk-construct/` or `assets/common/`
2. `npx projen` to regenerate this repo's own files (validates the templates are still readable/valid)
3. `npm test` to verify
4. Scaffold a throwaway project to verify end-to-end: `npx projen new --from @mavogel/mvc-projen@~0` in a scratch directory, and confirm the changed template shows up as expected

## Adding New Project Types

`MvcCdkConstructLibrary` (`src/projects/cdk-construct.ts`) is the only scaffolder class today. To add another (e.g. a CLI scaffolder):

1. Create the new class in `src/projects/`, extending the appropriate projen base class
2. Export it from `src/index.ts`
3. Add a corresponding `assets/<project-type>/` directory if it needs templates
4. Add/update tests in `test/` covering the new type
5. Document it in `README.md` (Features / Usage sections)
