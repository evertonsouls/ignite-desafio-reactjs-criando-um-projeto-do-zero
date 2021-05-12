import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../utils/formatDate';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;

  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  function handleLoadMore(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const morePosts = data.results.map(post => ({
          uid: post.uid,
          first_publication_date: String(post.first_publication_date),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        }));

        setPosts(state => [...state, ...morePosts]);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <div className={styles.container}>
        <img src="/logo.svg" alt="logo" />

        <main className={styles.content}>
          <div className={styles.posts}>
            {posts.map(({ uid, first_publication_date, data }) => (
              <Link key={uid} href={`/post/${uid}`}>
                <a>
                  <strong>{data.title}</strong>
                  <p>{data.subtitle}</p>
                  <div className={commonStyles.info}>
                    <time>
                      <FiCalendar size={20} />
                      {formatDate(first_publication_date)}
                    </time>
                    <span>
                      <FiUser size={20} />
                      {data.author}
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>

          {nextPage && (
            <div className={styles.loadMore}>
              <button type="button" onClick={handleLoadMore}>
                Carregar mais posts
              </button>
            </div>
          )}

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

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 5,
      fetch: ['posts.title', 'posts.author', 'posts.subtitle'],
      orderings: '[document.first_publication_date desc]',
      ref: previewData?.ref ?? null,
    }
  );

  const { next_page } = postsResponse;

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page,
        results: posts,
      },
      preview,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
