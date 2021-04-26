import { GetStaticProps } from 'next';
import { FiUser, FiCalendar } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
}

export default function Home(): JSX.Element {
  return (
    <div className={styles.container}>
      <img src="/logo.svg" alt="spacetraveling." />

      <main className={styles.content}>
        <div className={styles.posts}>
          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={commonStyles.info}>
              <time>
                <FiCalendar size={20} />
                15 Mar 2021
              </time>
              <span>
                <FiUser size={20} />
                Joseph Oliveira
              </span>
            </div>
          </a>

          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div>
              <time>
                <FiCalendar size={20} />
                15 Mar 2021
              </time>
              <span>
                <FiUser size={20} />
                Joseph Oliveira
              </span>
            </div>
          </a>

          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div>
              <time>
                <FiCalendar size={20} />
                15 Mar 2021
              </time>
              <span>
                <FiUser size={20} />
                Joseph Oliveira
              </span>
            </div>
          </a>
        </div>

        <div className={styles.loadMore}>
          <a href="/">Carregar mais posts</a>
        </div>
      </main>
    </div>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
