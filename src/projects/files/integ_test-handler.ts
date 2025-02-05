export const handler = async (event: any) => {
  const placeholder = event.placeholder || 'test';
  log({
    message: 'Login in',
    event,
  });

  try {
    if (!placeholder) {
      throw new Error('placeholder are required');
    }
    // No logs due to error 'Response object is too long'
    // https://github.com/aws/aws-cdk/issues/24490
    // log({ message: 'Fetching document', url })

    // Do logic here...
    return 'OK';
  } catch (err) {
    error({
      message: 'Error TBD',
    });
    return 'NOK';
  }
};

function log(msg: any) {
  console.log(JSON.stringify(msg));
}

function error(msg: any) {
  console.error(JSON.stringify(msg));
}
