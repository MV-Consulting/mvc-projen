import * as fs from 'fs';
import * as path from 'path';
import { cwd } from 'process';
import { Component, javascript, ReleasableCommits, TextFile, YamlFile } from 'projen';
import { AwsCdkConstructLibrary, AwsCdkConstructLibraryOptions, LambdaRuntime } from 'projen/lib/awscdk';
import { DependabotScheduleInterval } from 'projen/lib/github';
import { JobStep } from 'projen/lib/github/workflows-model';

// Set the minimum node version for AWS CDK and the GitHub actions workflow
const nodeVersion = '20.x';
const lambdaNodeVersion = LambdaRuntime.NODEJS_20_X;

/**
 * The options for the construct
 */
export interface MvcCdkConstructLibraryOptions extends AwsCdkConstructLibraryOptions {
  /**
   * Base directory for the assets
   *
   * @default ${cwd()}/node_modules/mvc-projen/assets
   */
  readonly baseAssetsDirectory?: string;

  /**
   * The regions to run the integ tests in
   *
   * @default eu-west-1 and eu-west-2
   */
  readonly integTestRegions?: string[];
}

/**
 * TypeScript library
 *
 * @pjid mvc-awscdk-construct
 */
export class MvcCdkConstructLibrary extends AwsCdkConstructLibrary {

  constructor(options: MvcCdkConstructLibraryOptions) {
    const baseAssetsDirectory = options.baseAssetsDirectory ?? `${cwd()}/node_modules/mvc-projen/assets`;

    super({
      authorOrganization: true,
      copyrightOwner: 'MV Consulting GmbH',
      copyrightPeriod: '2025',
      license: 'Apache-2.0',
      jsiiVersion: '~5.7.0',
      minNodeVersion: nodeVersion,
      workflowNodeVersion: nodeVersion,
      stability: 'experimental',
      releaseToNpm: true,
      packageManager: javascript.NodePackageManager.NPM,
      npmAccess: javascript.NpmAccess.PUBLIC,
      lambdaOptions: {
        runtime: lambdaNodeVersion,
        awsSdkConnectionReuse: false, // doesn't exist in AWS SDK JS v3
      },
      autoApproveOptions: {
        allowedUsernames: [
          'dependabot',
          'dependabot[bot]',
          'github-bot',
          'github-actions[bot]',
          'mvc-bot',
        ],
        // The name of the secret that has the GitHub PAT for auto-approving PRs with permissions repo, workflow, write:packages
        // Generate a new PAT (https://github.com/settings/tokens/new) and add it to your repo's secrets
        // NOTE: comes from MV-Consulting Org
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
      // experimentalIntegRunner: true,
      // manual integ test setup
      tsconfigDev: {
        compilerOptions: {},
        include: ['integ-tests/**/*.ts'],
      },
      pullRequestTemplateContents: [fs.readFileSync(`${baseAssetsDirectory}/common/github_pull_request.md`).toString()],
      // NOTE: issue templates are not supported yet. See https://github.com/projen/projen/pull/3648
      // issueTemplates: {}
      readme: {
        contents: [
          `
![Source](https://img.shields.io/github/stars/MV-Consulting/${options.name}?logo=github&label=GitHub%20Stars)
[![Build Status](https://github.com/MV-Consulting/${options.name}/actions/workflows/build.yml/badge.svg)](https://github.com/MV-Consulting/${options.name}/actions/workflows/build.yml)
[![ESLint Code Formatting](https://img.shields.io/badge/code_style-eslint-brightgreen.svg)](https://eslint.org)
[![Latest release](https://img.shields.io/github/release/MV-Consulting/${options.name}.svg)](https://github.com/MV-Consulting/${options.name}/releases)
![GitHub](https://img.shields.io/github/license/MV-Consulting/${options.name})
[![npm](https://img.shields.io/npm/dt/@mavogel/${options.name}?label=npm&color=orange)](https://www.npmjs.com/package/@mavogel/${options.name})
[![typescript](https://img.shields.io/badge/jsii-typescript-blueviolet.svg)](https://www.npmjs.com/package/@mavogel/${options.name})
          `,
          `# ${options.name}`,
          'My awesome description...',
          `
## Table of Contents

- [Features](#features)
- [Usage](#usage)
- [Solution Design](#solution-design)
- [Inspiration](#inspiration)

## Features

- ⚡ **Quick Setup**: TBD
- 📏 **Best Practice Setup**: TBD
- 🤹‍♂️ **Pre-installed packages**: TBD
- 🏗️ **Extensibility**: TBD

## Usage
The following steps get you started:

1. Create a new \`awscdk-app\` via
\`\`\`bash
npx projen new awscdk-app-ts --cdkVersion=2.177.0 --package-manager=npm
\`\`\`
3. Add \`@mavogel/${options.name}\` as a dependency to your project in the \`.projenrc.ts\` file
4. Run \`npx projen\` to install it
5. Add the following to the \`src/main.ts\` file:
\`\`\`ts
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Placeholder } from '@mavogel/${options.name}';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    new Placeholder(this, 'placeholder', {
      // and more... 💡
    });
  }
}

const env = {
  account: '123456789912',
  region: 'eu-central-1',
};

const app = new App();
new MyStack(app, 'placeholder', { env });
app.synth();
\`\`\`

and deploy it
\`\`\`bash
npx projen build
npx projen deploy
\`\`\`

with the output
\`\`\`console
TBD
\`\`\`

See the [examples](./examples) folder for more inspiration.

## Solution Design

<details>
  <summary>... if you're curious about click here for the details</summary>

![placeholder](docs/img/placeholder.drawio-min.png)

</details>

## Inspiration

add tools or links which inspired you
          `,
          fs.readFileSync(`${baseAssetsDirectory}/common/github_readme_cta.md`).toString(),
        ].join('\n'),
      },
      // NOTE: keep all the passed in options which can override the existing ones!
      ...options,
    });

    // gitignore
    const filesPatternToGitignore = [
      'tmp',
      '.codegpt',
    ];
    for (const file of filesPatternToGitignore) {
      this.gitignore.exclude(file);
    }
    this.addDeps(
      'cdk-nag@^2.35.0',
    );
    this.addDevDeps(
      `@aws-cdk/integ-runner@${this.cdkVersion}-alpha.0`, // NOTE: keep in sync with cdkversion
      `@aws-cdk/integ-tests-alpha@${this.cdkVersion}-alpha.0`,
      '@commitlint/cli@^19.6.1',
      '@commitlint/config-conventional@^19.6.0',
      'awslint@^2.72.1',
      'husky@^9.1.7',
    );

    this.package.setScript('prepare', 'husky');
    new TextFile(this, '.commitlintrc.js', {
      lines: [
        'module.exports = { extends: [\'@commitlint/config-conventional\'] };',
      ],
      marker: true,
    });

    this.package.setScript('awslint', 'awslint');
    // .github/workflows/build.yml
    const buildWorkflow = this.github?.tryFindWorkflow('build');
    if (!buildWorkflow) return;
    const buildJob = buildWorkflow.getJob('build');
    if (!buildJob || !('steps' in buildJob)) return;
    // TODO: figure out why wrong types
    const getBuildSteps = buildJob.steps as unknown as () => JobStep[];
    const buildJobSteps = getBuildSteps();
    buildWorkflow.updateJob('build', {
      ...buildJob,
      steps: [
        ...buildJobSteps.slice(0, 4),
        {
          name: 'Run awslint',
          run: 'npm run awslint',
        },
        ...buildJobSteps.slice(4),
      ],
    });

    this.package.setScript(
      'integ-test',
      `integ-runner --directory ./integ-tests ${options.integTestRegions?.map(region => `--parallel-regions ${region}`).join(' ')} --update-on-failed,`,
    );

    new TextFile(this, '.github/ISSUE_TEMPLATE/bug_report.md', {
      lines: [fs.readFileSync(`${baseAssetsDirectory}/common/github_bug_report.md`).toString()],
    });

    new TextFile(this, '.github/ISSUE_TEMPLATE/feature_request.md', {
      lines: [fs.readFileSync(`${baseAssetsDirectory}/common/github_feature_request.md`).toString()],
    });

    new YamlFile(this, '.github/FUNDING.yaml', {
      obj: {
        github: 'mavogel',
      },
    });

    new TextFile(this, 'CONTRIBUTING.md', {
      lines: [fs.readFileSync(`${baseAssetsDirectory}/common/contributing.md`).toString()],
    });

    new TextFile(this, '.prettierrc', {
      lines: [fs.readFileSync(`${baseAssetsDirectory}/common/prettierrc`).toString()],
    });

    // write sample code to main.ts & to main.test.ts
    if (options.sampleCode ?? true) {
      new SampleCode(this, {
        baseAssetsDirectory,
      });
    }
  }
}

interface SampleCodeOptions {
  readonly baseAssetsDirectory?: string;
}

class SampleCode extends Component {
  private readonly library: AwsCdkConstructLibrary;
  private readonly options: SampleCodeOptions;

  constructor(
    library: AwsCdkConstructLibrary,
    options: SampleCodeOptions,
  ) {
    super(library);
    this.library = library;
    this.options = options;
  }

  public synthesize() {
    const outdir = this.project.outdir;
    const srcdir = path.join(outdir, this.library.srcdir);
    if (
      fs.existsSync(srcdir) &&
      fs.readdirSync(srcdir).filter((x) => x.endsWith('.ts')) &&
      !fs.readFileSync(`${srcdir}/index.ts`).toString().includes('export class Hello') // Note: from parent
    ) {
      return;
    }

    fs.mkdirSync(srcdir, { recursive: true });
    fs.writeFileSync(path.join(srcdir, 'index.ts'), fs.readFileSync(`${this.options.baseAssetsDirectory}/cdk-construct/src_index.ts`).toString());
    fs.writeFileSync(path.join(srcdir, 'placeholder.ts'), fs.readFileSync(`${this.options.baseAssetsDirectory}/cdk-construct/src_placeholder.ts`).toString());
    // crd with lambda generation
    fs.mkdirSync(`${srcdir}/crd-example`, { recursive: true });
    fs.writeFileSync(path.join(`${srcdir}/crd-example`, 'crd-example.ts'), fs.readFileSync(`${this.options.baseAssetsDirectory}/cdk-construct/src_crd-example.ts`).toString());
    fs.writeFileSync(path.join(`${srcdir}/crd-example`, 'crd-example.lambda.ts'), fs.readFileSync(`${this.options.baseAssetsDirectory}/cdk-construct/src_crd-example.lambda.ts`).toString());


    const testdir = path.join(outdir, this.library.testdir);
    if (
      fs.existsSync(testdir) &&
      fs.readdirSync(testdir).filter((x) => x.endsWith('.ts')) &&
      !fs.existsSync(`${testdir}/hello.test.ts`) // Note: from parent
    ) {
      return;
    }
    // remove ${testdir}/hello.test.ts file. On the other hand, we override index.ts
    fs.unlinkSync(`${testdir}/hello.test.ts`);
    fs.mkdirSync(testdir, { recursive: true });
    fs.writeFileSync(path.join(testdir, 'index.test.ts'), fs.readFileSync(`${this.options.baseAssetsDirectory}/cdk-construct/test_index.test.ts`).toString());
    // lambda tests with jest stubs
    fs.mkdirSync(`${testdir}/crd-example`, { recursive: true });
    fs.writeFileSync(path.join(`${testdir}/crd-example`, 'crd-example.test.ts'), fs.readFileSync(`${this.options.baseAssetsDirectory}/cdk-construct/test_crd-example.test.ts`).toString());


    const integTestdir = path.join(outdir, 'integ-tests');
    if (
      fs.existsSync(integTestdir) &&
      fs.readdirSync(integTestdir).filter((x) => x.endsWith('.ts'))
    ) {
      return;
    }
    fs.mkdirSync(integTestdir, { recursive: true });
    fs.writeFileSync(path.join(integTestdir, 'integ.placeholder.ts'), fs.readFileSync(`${this.options.baseAssetsDirectory}/cdk-construct/integ_integ.placeholder.ts`).toString());

    const integTestFunctionsdir = path.join(integTestdir, 'functions');
    if (
      fs.existsSync(integTestFunctionsdir) &&
      fs.readdirSync(integTestFunctionsdir).filter((x) => x.endsWith('.ts'))
    ) {
      return;
    }
    fs.mkdirSync(integTestFunctionsdir, { recursive: true });
    fs.writeFileSync(path.join(integTestFunctionsdir, 'test-handler.ts'), fs.readFileSync(`${this.options.baseAssetsDirectory}/cdk-construct/integ_test-handler.ts`).toString());

    const docsdir = path.join(outdir, 'docs');
    if (
      fs.existsSync(docsdir) &&
      fs.readdirSync(docsdir).filter((x) => x.endsWith('.drawio'))
    ) {
      return;
    }
    fs.mkdirSync(docsdir, { recursive: true });
    fs.writeFileSync(path.join(docsdir, 'placeholder.drawio'), fs.readFileSync(`${this.options.baseAssetsDirectory}/common/docs_placeholder.drawio`).toString());

    const examplesdir = path.join(outdir, 'examples', 'simple');
    if (
      fs.existsSync(examplesdir) &&
      fs.readdirSync(examplesdir).filter((x) => x.endsWith('.drawio'))
    ) {
      return;
    }
    fs.mkdirSync(examplesdir, { recursive: true });
    fs.writeFileSync(path.join(examplesdir, 'main.ts'), fs.readFileSync(`${this.options.baseAssetsDirectory}/cdk-construct/examples_simple_main.ts`).toString());
  }
}