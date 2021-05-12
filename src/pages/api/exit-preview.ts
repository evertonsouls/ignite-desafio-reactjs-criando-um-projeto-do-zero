import { NextApiRequest, NextApiResponse } from 'next';

async function ExitPreview(
  _: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  res.clearPreviewData();

  res.writeHead(307, { Location: '/' });
  res.end();
}

export default ExitPreview;
