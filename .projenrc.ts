import { cdk, javascript } from 'projen';

const dependencies = ['projen@0.91.7', 'constructs'];

const project = new cdk.JsiiProject({
  author: 'Manuel Vogel',
  authorAddress: '8409778+mavogel@users.noreply.github.com',
  defaultReleaseBranch: 'main',
  jsiiReleaseVersion: '~5.7.0',
  name: 'mvc-projen',
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  repositoryUrl: 'https://github.com/MV-Consulting/mvc-projen',
  deps: dependencies,
  peerDeps: dependencies,
  description: 'Base projen module for MV Consulting projects',
  eslintOptions: {
    prettier: false,
    dirs: ['src'],
    ignorePatterns: ['**/*-function.ts', 'examples/'],
  },
});
project.synth();