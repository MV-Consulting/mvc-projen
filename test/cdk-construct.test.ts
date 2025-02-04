import { synthSnapshot } from 'projen/lib/util/synth';
import { MvcCdkConstructLibrary, MvcCdkConstructLibraryOptions } from '../src';

const minimalMvcCdkConstructLibraryOptions: MvcCdkConstructLibraryOptions = {
  author: 'test',
  authorAddress: 'test@test.com',
  cdkVersion: '2.1.0',
  name: 'test-project',
  defaultReleaseBranch: 'main',
  repositoryUrl: 'https://github.com/MV-Consulting/test-project.git',
};

describe('cdkVersion is >= 2.0.0', () => {
  test('check', () => {
    const project = new MvcCdkConstructLibrary(minimalMvcCdkConstructLibraryOptions);
    synthSnapshot(project);
  });
});


describe('configurations', () => {
  test('default all files written', () => {
    const project = new MvcCdkConstructLibrary(minimalMvcCdkConstructLibraryOptions);
    const snap = synthSnapshot(project);
    expect(
      snap['.github/ISSUE_TEMPLATE/bug_report.md'].indexOf('## Bug Report'),
    ).not.toEqual(-1);
    expect(
      snap['.github/ISSUE_TEMPLATE/feature_request.md'].indexOf('## Feature Request'),
    ).not.toEqual(-1);
    expect(
      snap['.github/pull_request_template.md'].indexOf('**Please check if the PR fulfills these requirements**'),
    ).not.toEqual(-1);
    expect(
      snap['.github/FUNDING.yaml'].indexOf('github: mavogel'),
    ).not.toEqual(-1);
    expect(
      snap['.commitlintrc.js'].indexOf('module.exports'),
    ).not.toEqual(-1);
    expect(
      snap['README.md'].indexOf('Unlock the Full Potential of Your AWS Cloud Infrastructure'),
    ).not.toEqual(-1);
  });
});