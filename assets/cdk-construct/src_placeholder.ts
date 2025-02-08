import { Aspects, CfnOutput, IAspect, Tags } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NagSuppressions } from 'cdk-nag';
import { Construct, IConstruct } from 'constructs';

/**
 * PlaceholderProps
 */
export interface PlaceholderProps {
  /**
   * Placeholder
   *
   * @default "placeholder"
   */
  readonly placeholder: string;

  /**
   * Additional tags to add to the instance
   *
   * @default - {}
   */
  readonly additionalTags?: { [key: string]: string };
}

/**
 * Placeholder class
 */
export class Placeholder extends Construct {
  public readonly placeholderProp: string;

  constructor(scope: Construct, id: string, props?: PlaceholderProps) {
    super(scope, id);

    // defaults
    this.placeholderProp = props?.placeholder ?? 'placeholder';
    // ... more

    const additionalTags = props?.additionalTags ?? {};
    const defaultTags = { app: 'placeholder' };

    const mergedTags = { ...defaultTags, ...additionalTags };
    Aspects.of(this).add(new NodeTagger(mergedTags));

    // resources
    const vpc = new ec2.Vpc(this, 'vpc', {
      vpcName: this.placeholderProp,
      maxAzs: 2,
      createInternetGateway: true,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });
    NagSuppressions.addResourceSuppressions(
      [vpc],
      [
        {
          id: 'AwsSolutions-VPC7',
          reason: 'For this tmp vpc we do not need flow logs',
        },
      ],
      true,
    );

    // outputs
    new CfnOutput(this, 'placeholder', {
      description: 'The placeholder',
      value: this.placeholderProp,
    });
  }
}

/**
 * Tags all the resources in the construct
 */
class NodeTagger implements IAspect {
  private readonly tags: { [key: string]: string };

  constructor(tags: { [key: string]: string }) {
    this.tags = tags;
  }

  visit(node: IConstruct) {
    Object.entries(this.tags).forEach(([key, value]) =>
      Tags.of(node).add(key, value),
    );
  }
}
