export const injectGrowiUriToView = (body: {view:string}, growiUri:string): void => {
  const parsedView = JSON.parse(body.view);
  const originalData = JSON.stringify(parsedView.private_metadata);

  parsedView.private_metadata = JSON.stringify({ growiUri, originalData });
  body.view = JSON.stringify(parsedView);
};
