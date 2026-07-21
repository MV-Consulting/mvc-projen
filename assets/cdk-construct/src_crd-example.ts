import { Stack, Validations } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnFunction, Function } from 'aws-cdk-lib/aws-lambda';
import { CustomResource, Duration, IResource } from 'aws-cdk-lib/core';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { CrdExampleFunction } from './crd-example-function';

// The AWSLambdaBasicExecutionRole ARN pattern is the same for every Lambda
// function using the default execution role, regardless of the consumer's
// own construct IDs -- safe to acknowledge literally.
const AWS_LAMBDA_BASIC_EXECUTION_ROLE_IAM4 =
  'AwsSolutions-IAM4[Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole]';

// cdk-nag v3's granular IAM4/IAM5 finding ids embed an ARN, which contains
// its own "::" sequences. Validations.of().acknowledge() rejects any id with
// more than one "::" (see aws-cdk-lib's Validations.qualifyId), so it can
// never acknowledge these ARN-based findings. Write the same metadata entry
// it writes internally, using the public ACKNOWLEDGED_RULES_METADATA_KEY,
// bypassing only the over-strict id validation.
function acknowledgeGranularFinding(construct: Construct, id: string, reason: string): void {
  construct.node.addMetadata(Validations.ACKNOWLEDGED_RULES_METADATA_KEY, { [id]: reason });
}

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
    acknowledgeGranularFinding(
      onEvent,
      AWS_LAMBDA_BASIC_EXECUTION_ROLE_IAM4,
      'For this event handler we do not need to restrict managed policies',
    );
    Validations.of(onEvent).acknowledge({
      id: 'AwsSolutions-L1',
      reason: 'For this lambda the latest runtime is not needed',
    });

    onEvent.addToRolePolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [this.secretArn],
      }),
    );

    const provider = new Provider(scope, 'SecretRetrieveProvider', {
      onEventHandler: onEvent,
    });
    acknowledgeGranularFinding(
      provider,
      AWS_LAMBDA_BASIC_EXECUTION_ROLE_IAM4,
      'For this provider we do not need to restrict managed policies',
    );
    // cdk-nag v3 requires the exact granular finding id (no prefix/bulk
    // suppression) -- resolve onEvent's CloudFormation logical id at
    // synth time instead of hardcoding it, since it depends on whatever
    // construct id the consumer gives their Placeholder-like construct.
    const onEventLogicalId = Stack.of(onEvent).getLogicalId(
      onEvent.node.defaultChild as CfnFunction,
    );
    Validations.of(provider).acknowledge({
      id: `AwsSolutions-IAM5[Resource::<${onEventLogicalId}.Arn>:*]`,
      reason: 'For this provider wildcards are fine',
    });
    Validations.of(provider).acknowledge({
      id: 'AwsSolutions-L1',
      reason: 'For this provider the latest runtime is not needed',
    });

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
