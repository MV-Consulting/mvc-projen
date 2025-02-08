import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Placeholder } from '../../src/index'

export class MyStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps = {}) {
        super(scope, id, props);

        new Placeholder(this, 'placeholder', {
            placeholder: 'placeholder',
        });
    }
}

const env = {
    account: '123456789912',
    region: 'eu-central-1',
};

const app = new App();
new MyStack(app, 'placeholder', { env });
app.synth();