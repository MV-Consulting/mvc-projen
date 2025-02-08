import * as path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IntegTest, LogType, InvocationType, ExpectedResult } from '@aws-cdk/integ-tests-alpha';
import {
  App,
  Duration,
  PhysicalName,
  Stack,
  aws_lambda as lambda,
} from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Placeholder } from '../src';
// CDK App for Integration Tests
const app = new App();
// Stack under test
const stackUnderTest = new Stack(app, 'IntegTestStackPlaceholder', {
  description: "This stack includes the application's resources for integration testing.",
});

const constructUnderTest = new Placeholder(stackUnderTest, 'IntegPlaceholder', {
  placeholder: 'placeholder',
});

const integ = new IntegTest(app, 'IntegSetupPlaceholder', {
  testCases: [stackUnderTest], // Define a list of cases for this test
  cdkCommandOptions: {
    destroy: {
      args: {
        force: true,
      },
    },
  },
  regions: [stackUnderTest.region],
});

const loginHandler = new NodejsFunction(stackUnderTest, 'test-handler', {
  functionName: PhysicalName.GENERATE_IF_NEEDED,
  entry: path.join(__dirname, 'functions', 'test-handler.ts'),
  runtime: lambda.Runtime.NODEJS_20_X,
  logRetention: 1,
  timeout: Duration.seconds(30),
  bundling: {
    esbuildArgs: {
      '--packages': 'bundle',
    },
  },
});

/**
 * Assertion:
 * Should find the server login page
 */
const sendTestLoginAssertion = integ.assertions
  .invokeFunction({
    functionName: loginHandler.functionName,
    logType: LogType.TAIL,
    invocationType: InvocationType.REQUEST_RESPONSE, // to run it synchronously
    payload: JSON.stringify({
      placeholder: constructUnderTest.placeholderProp,
    }),
  }).expect(ExpectedResult.objectLike({ Payload: '"OK"' }));

/**
 * Main test case
 */
// Attempt a login at the domain with the given password
sendTestLoginAssertion;