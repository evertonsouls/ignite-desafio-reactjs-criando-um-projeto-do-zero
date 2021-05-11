import { GetStaticPaths, GetStaticProps } from 'next';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../utils/formatDate';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps): JSX.Element {
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
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: '*',
      pageSize: 5,
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const { uid, first_publication_date, data } = await prismic.getByUID(
    'posts',
    String(slug),
    {}
  );

  const post = {
    uid,
    first_publication_date: String(first_publication_date),
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

  return {
    props: { post },
    revalidate: 60 * 30, // 30 minutes
  };
};
