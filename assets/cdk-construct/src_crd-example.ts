import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { CustomResource, Duration, IResource } from 'aws-cdk-lib/core';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { CrdExampleFunction } from './crd-example-function';

export interface Secret {
  username: string;
  password: string;
}

export interface CrdExampleOptionsBase {
  readonly secretArn: string;
}

export interface CrdExampleOptions extends CrdExampleOptionsBase {}

export abstract class CrdExample {
  public static new(options: CrdExampleOptions): CrdExample {
    return new (class extends CrdExample {
      public _bind(scope: Construct): CrdExample {
        const crdExample = new CustomResourceCrdExample(scope, {
          secretArn: options.secretArn,
        });

        return crdExample;
      }
    })();
  }

  public secretArn!: string;
  public crdExampleArn!: string;
  public secretPasswordPlaintext!: string;
  public customResource!: IResource;

  /**
   * @internal
   */
  protected constructor() {}

  /**
   * @internal
   */
  public abstract _bind(scope: Construct): any;
}

interface CustomResourceCrdExampleOptions extends CrdExampleOptions {}

class CustomResourceCrdExample extends CrdExample {
  constructor(scope: Construct, options: CustomResourceCrdExampleOptions) {
    super();

    this.secretArn = options.secretArn;

    const onEvent: Function = new CrdExampleFunction(
      scope,
      'CrdExampleOnEventHandler',
      {
        timeout: Duration.seconds(10),
        memorySize: 128,
      },
    );
    NagSuppressions.addResourceSuppressions(
      [onEvent],
      [
        {
          id: 'AwsSolutions-IAM4',
          reason:
            'For this event handler we do not need to restrict managed policies',
        },
        {
          id: 'AwsSolutions-L1',
          reason: 'For this lambda the latest runtime is not needed',
        },
      ],
      true,
    );

    onEvent.addToRolePolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [this.secretArn],
      }),
    );

    const provider = new Provider(scope, 'SecretRetrieveProvider', {
      onEventHandler: onEvent,
    });
    NagSuppressions.addResourceSuppressions(
      [provider],
      [
        {
          id: 'AwsSolutions-IAM4',
          reason:
            'For this provider we do not need to restrict managed policies',
        },
        {
          id: 'AwsSolutions-IAM5',
          reason: 'For this provider wildcards are fine',
        },
        {
          id: 'AwsSolutions-L1',
          reason: 'For this provider the latest runtime is not needed',
        },
      ],
      true,
    );

    const resource = new CustomResource(
      scope,
      'CrdExampleCustomResource',
      {
        serviceToken: provider.serviceToken,
        properties: {
          SecretArn: options.secretArn,
          ServiceTimeout: 305,
        },
      },
    );

    this.secretPasswordPlaintext = resource.getAttString('secretPasswordValue');
    this.customResource = resource;
  }

  public _bind() {}
}
