import { cdk, javascript, ReleasableCommits } from 'projen';
import { DependabotScheduleInterval } from 'projen/lib/github';
import { NpmAccess } from 'projen/lib/javascript';

// Find the latest projen version here: https://www.npmjs.com/package/projen
const projenVersion = '0.97.2';
const dependencies = [
  `projen@${projenVersion}`, // DO not move the index 0 to another position!
  'constructs@^10.4.2',
];

const project = new cdk.JsiiProject({
  author: 'Manuel Vogel',
  authorAddress: '8409778+mavogel@users.noreply.github.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.9.0',
  projenVersion: projenVersion,
  name: 'mvc-projen',
  packageName: '@mavogel/mvc-projen',
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  repositoryUrl: 'https://github.com/MV-Consulting/mvc-projen',
  deps: dependencies,
  peerDeps: dependencies,
  devDeps: [
    '@commitlint/cli',
    '@commitlint/config-conventional',
    'husky',
  ],
  description: 'Base projen module for MV Consulting projects',
  npmAccess:
    NpmAccess.PUBLIC /* The npm access level to use when releasing this module. */,
  keywords: ['aws', 'cdk', 'construct', 'projen'],
  autoApproveOptions: {
    allowedUsernames: [
      'dependabot',
      'dependabot[bot]',
      'github-bot',
      'github-actions[bot]',
      'mvc-bot',
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
  // See https://github.com/projen/projen/discussions/4040#discussioncomment-11905628
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
    ignorePatterns: [
      '**/*-function.ts',
      'examples/',
    ],
  },
  gitignore: ['tmp', '.codegpt'],
  // see details for each: https://github.com/cdklabs/publib
  // Go
  publishToGo: {
    moduleName: 'github.com/MV-Consulting/mvc-projen',
    githubTokenSecret: 'PROJEN_GITHUB_TOKEN',
  },
  // see https://github.com/cdklabs/publib/issues/1305
  // Java
  // publishToMaven: {
  //   javaPackage: 'io.github.mv-consulting.cdk.vscode.server',
  //   mavenGroupId: 'io.github.mv-consulting',
  //   mavenArtifactId: 'cdkvscodeserver',
  // },

  // Note: Microsoft Account needed
  // C# and F# for .NET
  // publishToNuget: {
  //   dotNetNamespace: 'MvConsulting',
  //   packageId: 'CdkVscodeServer',
  // },
  // Python
  publishToPypi: {
    distName: 'mvc-projen',
    module: 'mvc-projen',
  },
  pullRequestTemplateContents: [
    `
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
- \`npx projen --version\`:
- version of the jsii lib: \`x.x.x\`
  `,
  ],
});

project.package.setScript('prepare', 'husky');
project.synth();