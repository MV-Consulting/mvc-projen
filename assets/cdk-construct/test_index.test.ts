import * as fs from 'fs';
import * as path from 'path';
import { App, Stack, Validations } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Placeholder } from '../src';

describe('placeholder-nag-AwsSolutions-Pack', () => {
  let stack: Stack;
  let app: App;
  // In this case we can use beforeAll() over beforeEach() since our tests
  // do not modify the state of the application
  beforeAll(() => {
    // GIVEN
    app = new App({ context: { '@aws-cdk/core:validationReportJson': true } });
    stack = new Stack(app, 'testStack', {
      env: {
        region: 'us-east-1',
        account: '1234',
      },
    });

    new Placeholder(stack, 'Placeholder', {
      placeholder: 'placeholder',
    });

    // WHEN
    Validations.of(app).addPlugins(new AwsSolutionsChecks(app, { verbose: true }));
  });

  // THEN
  // cdk-nag v3 reports violations via a policy-validation-report.json in the
  // cloud assembly rather than throwing on app.synth() -- read it directly.
  test('produces no unacknowledged AwsSolutions violations', () => {
    const assembly = app.synth();
    const reportPath = path.join(assembly.directory, 'policy-validation-report.json');
    const violations = fs.existsSync(reportPath)
      ? JSON.parse(fs.readFileSync(reportPath, 'utf-8')).pluginReports.flatMap(
        (report: { violations?: unknown[] }) => report.violations ?? [],
      )
      : [];
    expect(violations).toHaveLength(0);
  });
});
