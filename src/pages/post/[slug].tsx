import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../utils/formatDate';
import { formatDateLong } from '../../utils/formatDateLong';
import Header from '../../components/Header';
import UtterancesComments from '../../components/UtterancesComments';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  next_url: { title: string; url: string };
  previous_url: { title: string; url: string };
}

export default function Post({
  post,
  preview,
  next_url,
  previous_url,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const wordsCount = post.data.content.reduce((acc, content) => {
    const body = RichText.asText(content.body).split(' ');

    return acc + body.length;
  }, 0);

  const minutesToRead = Math.ceil(wordsCount / 200);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <div className={styles.container}>
        <Header />

        <figure className={styles.banner}>
          <img src={post.data.banner.url} alt={post.data.title} />
        </figure>

        <main className={styles.content}>
          <article className={styles.post}>
            <header>
              <h1>{post.data.title}</h1>
              <div className={commonStyles.info}>
                <time>
                  <FiCalendar size={20} />
                  {formatDate(post.first_publication_date)}
                </time>
                <span>
                  <FiUser size={20} />
                  {post.data.author}
                </span>
                <span>
                  <FiClock size={20} />
                  {minutesToRead} min
                </span>
              </div>
              <time>{formatDateLong(post.last_publication_date)}</time>
            </header>

            {post.data.content.map(content => (
              <div key={content.heading} className={styles.postContent}>
                <h2>{content.heading}</h2>

                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </article>

          {(previous_url || next_url) && (
            <div className={styles.navigation}>
              {previous_url && (
                <div>
                  <span>{previous_url.title}</span>
                  <Link href={previous_url.url}>
                    <a>Post anterior</a>
                  </Link>
                </div>
              )}

              {next_url && (
                <div className={styles.nextContainer}>
                  <span>{next_url.title}</span>
                  <Link href={next_url.url}>
                    <a>Próximo post</a>
                  </Link>
                </div>
              )}
            </div>
          )}

          <UtterancesComments />

          {preview && (
            <aside className={commonStyles.exitPreviewMode}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 5,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const paths = response.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
  params,
}) => {
  const prismic = getPrismicClient();

  const { slug } = params;
  let next_url = null;
  let previous_url = null;

  const {
    uid,
    first_publication_date,
    last_publication_date,
    data,
  } = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post = {
    uid,
    first_publication_date,
    last_publication_date,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      banner: {
        url: data.banner.url,
      },
      author: data.author,
      content: data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
    },
  };

  if (first_publication_date) {
    const responsePrevious = await prismic.query(
      Prismic.predicates.dateBefore(
        'document.first_publication_date',
        first_publication_date
      ),
      {
        pageSize: 1,
        fetch: ['posts.title'],
        orderings: '[document.first_publication_date desc]',
      }
    );

    if (responsePrevious.results.length > 0) {
      const [previousPost] = responsePrevious.results;
      if (previousPost.data) {
        previous_url = {
          title: previousPost.data.title,
          url: `/post/${previousPost.uid}`,
        };
      }
    }

    const responseNext = await prismic.query(
      Prismic.predicates.dateAfter(
        'document.first_publication_date',
        first_publication_date
      ),
      {
        pageSize: 1,
        fetch: ['posts.title'],
        orderings: '[document.first_publication_date]',
      }
    );

    if (responseNext.results.length > 0) {
      const [nextPost] = responseNext.results;
      if (nextPost.data) {
        next_url = {
          title: nextPost.data.title,
          url: `/post/${nextPost.uid}`,
        };
      }
    }
  }

  return {
    props: { post, preview, next_url, previous_url },
    revalidate: 60 * 30, // 30 minutes
  };
};
