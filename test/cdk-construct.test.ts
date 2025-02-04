import { synthSnapshot } from 'projen/lib/util/synth';
import { MvcCdkConstructLibrary } from '../src';

describe('configurations', () => {
  test('default all files written', () => {
    const project = new MvcCdkConstructLibrary({
      author: 'test',
      authorAddress: 'test@test.com',
      cdkVersion: '1.0.0',
      name: 'test-project',
      defaultReleaseBranch: 'main',
      repositoryUrl: 'https://github.com/MV-Consulting/test-project.git',
    });
    const snap = synthSnapshot(project); //, { parseJson: false });
    expect(
      snap['.github/FUNDING.yaml'].indexOf('github: mavogel'),
    ).not.toEqual(-1);
  });
});