import { awscdk, javascript, ReleasableCommits, TextFile } from 'projen';
import { DependabotScheduleInterval } from 'projen/lib/github';

export interface MvcCdkConstructLibraryOptions extends awscdk.AwsCdkConstructLibraryOptions {
  //
}

/**
 * TypeScript library
 *
 * @pjid mvc-awscdk-construct
 */
export class MvcCdkConstructLibrary extends awscdk.AwsCdkConstructLibrary {

  constructor(options: MvcCdkConstructLibraryOptions) {
    super({
      authorOrganization: true,
      copyrightOwner: 'MV Consulting GmbH',
      copyrightPeriod: '2025',
      license: 'Apache-2.0',
      projenVersion: '0.91.6', // Find the latest projen version here: https://www.npmjs.com/package/projen
      stability: 'experimental',
      releaseToNpm: true,
      npmAccess: javascript.NpmAccess.PUBLIC,
      autoApproveOptions: {
        allowedUsernames: [
          'dependabot',
          'dependabot[bot]',
          'github-bot',
          'github-actions[bot]',
          'mvc-projen[bot]',
        ],
        /**
                                 * The name of the secret that has the GitHub PAT for auto-approving PRs with permissions repo, workflow, write:packages
                                 * Generate a new PAT (https://github.com/settings/tokens/new) and add it to your repo's secrets
                                 */
        secret: 'PROJEN_GITHUB_TOKEN',
      },
      dependabot: true,
      dependabotOptions: {
        scheduleInterval: DependabotScheduleInterval.WEEKLY,
        labels: ['dependencies', 'auto-approve'],
        groups: {
          default: {
            patterns: ['*'],
            excludePatterns: ['aws-cdk*', 'projen'],
          },
        },
        ignore: [{ dependencyName: 'aws-cdk-lib' }, { dependencyName: 'aws-cdk' }],
      },
      // // See https://github.com/projen/projen/discussions/4040#discussioncomment-11905628
      releasableCommits: ReleasableCommits.ofType([
        'feat',
        'fix',
        'chore',
        'refactor',
        'perf',
      ]),
      githubOptions: {
        pullRequestLintOptions: {
          semanticTitleOptions: {
            // see commit types here: https://www.conventionalcommits.org/en/v1.0.0/#summary
            types: [
              'feat',
              'fix',
              'chore',
              'refactor',
              'perf',
              'docs',
              'style',
              'test',
              'build',
              'ci',
            ],
          },
        },
      },
      versionrcOptions: {
        types: [
          { type: 'feat', section: 'Features' },
          { type: 'fix', section: 'Bug Fixes' },
          { type: 'chore', section: 'Chores' },
          { type: 'docs', section: 'Docs' },
          { type: 'style', hidden: true },
          { type: 'refactor', hidden: true },
          { type: 'perf', section: 'Performance' },
          { type: 'test', hidden: true },
        ],
      },
      eslintOptions: {
        prettier: false,
        dirs: ['src'],
        ignorePatterns: ['**/*-function.ts', 'examples/'],
      },
      gitignore: ['tmp', '.codegpt'],
      devDeps: [
        '@aws-cdk/integ-runner@^2.177.0-alpha.0',
        '@aws-cdk/integ-tests-alpha@^2.177.0-alpha.0',
        '@commitlint/cli',
        '@commitlint/config-conventional',
        '@types/aws-lambda',
        'awslint',
        'husky',
      ],
      // experimentalIntegRunner: true,
      // manual integ test setup
      tsconfigDev: {
        compilerOptions: {},
        include: ['integ-tests/**/*.ts'],
      },
      pullRequestTemplateContents: [`
**Please check if the PR fulfills these requirements**
- [ ] The commit message describes your change
- [ ] Tests for the changes have been added if possible (for bug fixes / features)
- [ ] Docs have been added / updated (for bug fixes / features)

**What kind of change does this PR introduce? (Bug fix, feature, documentation, performance ...)**
> add here...

**What is the current behaviour? (You can also link to an open issue here)**
> add here...

**What is the new behaviour (if this is a feature change)?**
> add here...

**Does this PR introduce a breaking change? (What changes might users need to make in their setup due to this PR?)**
> add here...

**Environment**
- \`node --version\`:
- \`npx cdk --version\`:
- version of the construct: \`x.x.x\`
`],
      // NOTE: issue templates are not supported yet. See https://github.com/projen/projen/pull/3648
      // issueTemplates: {}
      ...options,
    });

    new TextFile(this, '.github/ISSUE_TEMPLATE/bug_report.md', {
      lines: [`
---
name: "\\U0001F41B Bug Report"
about: "If something isn't working as expected \\U0001F914."
title: ''
labels: 'i: bug, i: needs triage'
assignees: ''

---

## Bug Report

**Current Behavior**
A clear and concise description of the behavior.

**Input Code / configuration of the construct**
\`\`\`ts
new TheConstruct(this, 'theConstruct', {
    // the props passed in...
})
\`\`\`

**Expected behavior/code**
A clear and concise description of what you expected to happen (or code).

**Commands you ran**
\`\`\`bash
npx run build # for example
\`\`\`

**Environment**
- \`node --version\`:
- \`npx cdk --version\`:
- version of the construct: \`x.x.x\`

**Possible Solution**
<!--- Only if you have suggestions on a fix for the bug -->

**Additional context/Screenshots**
Add any other context about the problem here. If applicable, add screenshots to help explain.
        `],
    });

    new TextFile(this, '.github/ISSUE_TEMPLATE/feature_request.md', {
      lines: [`
---
name: "\\U0001F680 Feature Request"
about: "I have a suggestion (and may want to implement it \U0001F642)!"
title: ''
labels: 'i: enhancement, i: needs triage'
assignees: ''

---

## Feature Request

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I have an issue when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen. Add any considered drawbacks.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Teachability, Documentation, Adoption, Migration Strategy**
If you can, explain how users will be able to use this and possibly write out a version the docs.

Maybe a screenshot or design?
        `],
    });

    new TextFile(this, '.github/FUNDING.yaml', {
      lines: [
        'github: mavogel',
      ],
    });
  }


}