import { cdk, javascript } from 'projen';
const project = new cdk.JsiiProject({
  author: 'Manuel Vogel',
  authorAddress: '8409778+mavogel@users.noreply.github.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  name: 'mvc-projen',
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  repositoryUrl: 'https://github.com/8409778+mavogel/mvc-projen.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();