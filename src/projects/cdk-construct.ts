import * as fs from 'fs';
import * as path from 'path';
import { cwd } from 'process';
import { Component, javascript, ReleasableCommits, TextFile } from 'projen';
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
  //
}

/**
 * TypeScript library
 *
 * @pjid mvc-awscdk-construct
 */
export class MvcCdkConstructLibrary extends AwsCdkConstructLibrary {

  constructor(options: MvcCdkConstructLibraryOptions) {
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
      pullRequestTemplateContents: [fs.readFileSync(`${cwd()}/src/projects/files/github_pull_request.md`).toString()],
      // NOTE: issue templates are not supported yet. See https://github.com/projen/projen/pull/3648
      // issueTemplates: {}
      readme: {
        contents: [
          '# TODO',
          '',
          fs.readFileSync(`${cwd()}/src/projects/files/github_readme_cta.md`).toString(),
        ].join('\n'),
      },
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
    this.addDeps('cdk-nag');
    this.addDevDeps(
      `@aws-cdk/integ-runner@^${this.cdkVersion}-alpha.0`, // NOTE: keep in sync with cdkversion
      `@aws-cdk/integ-tests-alpha@^${this.cdkVersion}-alpha.0`,
      '@commitlint/cli',
      '@commitlint/config-conventional',
      'awslint',
      'husky',
    );

    this.package.setScript('prepare', 'husky');
    new TextFile(this, '.commitlintrc.js', {
      lines: [
        'module.exports = { extends: [\'@commitlint/config-conventional\'] };',
      ],
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
      'integ-runner --directory ./integ-tests --parallel-regions eu-west-1 --parallel-regions eu-west-2 --update-on-failed',
    );

    new TextFile(this, '.github/ISSUE_TEMPLATE/bug_report.md', {
      lines: [fs.readFileSync(`${cwd()}/src/projects/files/github_bug_report.md`).toString()],
    });

    new TextFile(this, '.github/ISSUE_TEMPLATE/feature_request.md', {
      lines: [fs.readFileSync(`${cwd()}/src/projects/files/github_feature_request.md`).toString()],
    });

    new TextFile(this, '.github/FUNDING.yaml', {
      lines: [
        'github: mavogel',
      ],
    });

    // write sample code to main.ts & to main.test.ts
    if (options.sampleCode ?? true) {
      new SampleCode(this, {});
    }
  }
}

interface SampleCodeOptions { }

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
    console.log(this.options); // TODO
    const outdir = this.project.outdir;
    const srcdir = path.join(outdir, this.library.srcdir);
    if (
      fs.existsSync(srcdir) &&
      fs.readdirSync(srcdir).filter((x) => x.endsWith('.ts'))
    ) {
      return;
    }

    fs.mkdirSync(srcdir, { recursive: true });
    fs.writeFileSync(path.join(srcdir, 'index.ts'), fs.readFileSync(`${cwd()}/src/projects/files/src_index.ts`).toString());
    fs.writeFileSync(path.join(srcdir, 'placeholder.ts'), fs.readFileSync(`${cwd()}/src/projects/files/src_placeholder.ts`).toString());

    const testdir = path.join(outdir, this.library.testdir);
    if (
      fs.existsSync(testdir) &&
      fs.readdirSync(testdir).filter((x) => x.endsWith('.ts'))
    ) {
      return;
    }
    fs.mkdirSync(testdir, { recursive: true });
    fs.writeFileSync(path.join(testdir, 'index.test.ts'), fs.readFileSync(`${cwd()}/src/projects/files/src_index.test-xyz.ts`).toString());

    const integTestdir = path.join(outdir, 'integ-tests');
    if (
      fs.existsSync(integTestdir) &&
      fs.readdirSync(integTestdir).filter((x) => x.endsWith('.ts'))
    ) {
      return;
    }
    fs.mkdirSync(integTestdir, { recursive: true });
    fs.writeFileSync(path.join(integTestdir, 'integ.placeholder.ts'), fs.readFileSync(`${cwd()}/src/projects/files/integ_integ.placeholder.ts`).toString());

    const integTestFunctionsdir = path.join(outdir, integTestdir, 'functions');
    if (
      fs.existsSync(integTestFunctionsdir) &&
      fs.readdirSync(integTestFunctionsdir).filter((x) => x.endsWith('.ts'))
    ) {
      return;
    }
    fs.mkdirSync(integTestFunctionsdir, { recursive: true });
    fs.writeFileSync(path.join(integTestFunctionsdir, 'test-handler.ts'), fs.readFileSync(`${cwd()}/src/projects/files/integ_test-handler.ts`).toString());

    const docsdir = path.join(outdir, 'docs');
    if (
      fs.existsSync(docsdir) &&
      fs.readdirSync(docsdir).filter((x) => x.endsWith('.drawio'))
    ) {
      return;
    }
    fs.mkdirSync(docsdir, { recursive: true });
    fs.writeFileSync(path.join(docsdir, 'placeholder.drawio'), fs.readFileSync(`${cwd()}/src/projects/files/docs_placeholder.drawio`).toString());

    const examplesdir = path.join(outdir, 'examples', 'simple');
    if (
      fs.existsSync(examplesdir) &&
      fs.readdirSync(examplesdir).filter((x) => x.endsWith('.drawio'))
    ) {
      return;
    }
    fs.mkdirSync(examplesdir, { recursive: true });
    fs.writeFileSync(path.join(examplesdir, 'main.ts'), fs.readFileSync(`${cwd()}/src/projects/files/examples_simple_main.ts`).toString());
  }
}