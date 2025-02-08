// UNCOMMENT
// const spyGetSecretValue = jest.fn();
// const spySecM = jest.fn(() => ({
//   getSecretValue: spyGetSecretValue,
// }));

// Mock the SSM client
// jest.mock("@aws-sdk/client-secrets-manager", () => ({
//   SecretsManager: spySecM,
// }));

// eslint-disable-next-line import/no-unresolved
// import type { OnEventRequest } from 'aws-cdk-lib/custom-resources/lib/provider-framework/types';
// import { handler } from '../../src/crd-example/crd-example.lambda';  // <- UNCOMMENT

describe('secret-retriever lambda', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {});

  test('should handle successful Secret retrieval', async () => {
    // UNCOMMENT
    // const secretString = '{"username":"john","password":"foobar"}';
    // spyGetSecretValue.mockImplementation(() => ({
    //   SecretString: secretString,
    // }));

    // const secretArn = 'arn:123';
    // const event = {
    //   RequestType: 'Create',
    //   ResourceProperties: {
    //     SecretArn: secretArn,
    //   },
    // } as unknown as OnEventRequest;

    // const result = await handler(event);

    // expect(spyGetSecretValue).toHaveBeenCalledWith({
    //   SecretId: secretArn,
    // });

    // expect(result).toEqual({
    //   Data: {
    //     secretPasswordValue: "foobar",
    //   },
    // });
  });

  test('should fail to handle Secret retrieval', async () => {
    // UNCOMMENT
    // const errorMessage = 'Failed to retrieve secret';
    // spyGetSecretValue.mockImplementation(() => {
    //   throw new Error(errorMessage);
    // });

    // const event = {
    //   RequestType: 'Create',
    //   ResourceProperties: {
    //     SecretArn: 'arn:123',
    //   },
    // } as unknown as OnEventRequest;

    // await expect(handler(event)).rejects.toThrow(errorMessage);
  });
});
