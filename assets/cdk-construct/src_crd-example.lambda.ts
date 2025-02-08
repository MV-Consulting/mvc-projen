// import { SecretsManager } from "@aws-sdk/client-secrets-manager"; <- UNCOMMENT
// @ts-ignore
import type {
  OnEventRequest,
  OnEventResponse,
} from 'aws-cdk-lib/custom-resources/lib/provider-framework/types';
// import { Secret } from "./crd-example"; // <- UNCOMMENT

// const secretsManager = new SecretsManager(); <- UNCOMMENT

export const handler = async (
  event: OnEventRequest,
): Promise<OnEventResponse> => {
  console.log('Event: %j', { ...event, ResponseURL: '...' });

  if (event.RequestType === 'Delete') {
    // do nothing
    return {};
  }

  // Create and update case
  // const secretArn = event.ResourceProperties.SecretArn; // <- UNCOMMENT

  try {
    // const secret = await secretsManager.getSecretValue({
    //   SecretId: secretArn,
    // });

    // const parsedSecretValue: Secret = JSON.parse(secretValue);
    // console.log("secretValue is JSON: %j", parsedSecretValue);

    // UNCOMMENT -^

    return {
      Data: {
        secretPasswordValue: 'secret-value', // parsedSecretValue.password, <- UNCOMMENT
      },
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
