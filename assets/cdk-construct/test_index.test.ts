import { App, Aspects, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Placeholder } from '../src';

describe('placeholder-nag-AwsSolutions-Pack', () => {
  let stack: Stack;
  let app: App;
  // In this case we can use beforeAll() over beforeEach() since our tests
  // do not modify the state of the application
  beforeAll(() => {
    // GIVEN
    app = new App();
    stack = new Stack(app, 'testStack', {
      env: {
        region: 'us-east-1',
        account: '1234',
      },
    });

    new Placeholder(stack, 'Placeholder', {
      placeholder: 'placeholder',
    });
    // suppressCommonNags(stack);

    // WHEN
    Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
  });

  // THEN
  test('No unsuppressed Warnings', () => {
    const warnings = Annotations.fromStack(stack).findWarning(
      '*',
      Match.stringLikeRegexp('AwsSolutions-.*'),
    );
    expect(warnings).toHaveLength(0);
  });

  test('No unsuppressed Errors', () => {
    const errors = Annotations.fromStack(stack).findError(
      '*',
      Match.stringLikeRegexp('AwsSolutions-.*'),
    );
    if (errors.length > 0) {
      for (const error of errors) {
        console.log(`id: '${error.id}': ${error.entry.data}`);
      }
    }
    expect(errors).toHaveLength(0);
  });
});
