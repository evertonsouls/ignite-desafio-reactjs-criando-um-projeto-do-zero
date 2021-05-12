import { NextApiRequest, NextApiResponse } from 'next';
import { Document } from '@prismicio/client/types/documents';
import { getPrismicClient } from '../../services/prismic';

function linkResolver(document: Document): string {
  if (document.type === 'posts') {
    return `/post/${document.uid}`;
  }

  return '/';
}

async function Preview(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { token, documentId } = req.query;

  const prismic = getPrismicClient(req);

  const previewResolver = prismic.getPreviewResolver(
    String(token),
    String(documentId)
  );

  const redirectUrl = await previewResolver.resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref: token });

  // Redirect the user to the share endpoint from same origin. This is
  // necessary due to a Chrome bug:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=696204
  res.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
      <script>window.location.href = '${redirectUrl}'</script>
    </head>`
  );
  res.end();
}

export default Preview;
