import { GetStaticPaths, GetStaticProps } from 'next';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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

export default function Post(): JSX.Element {
  return (
    <div className={styles.container}>
      <header>
        <img src="/logo.svg" alt="spacetraveling." />
      </header>

      <figure className={styles.banner}>
        <img src="/banner.png" alt="Eat Sleep Code Repeat" />
      </figure>

      <main className={styles.content}>
        <article className={styles.post}>
          <header>
            <h1>Criando um app CRA do zero</h1>
            <div className={commonStyles.info}>
              <time>
                <FiCalendar size={20} />
                15 Mar 2021
              </time>
              <span>
                <FiUser size={20} />
                Joseph Oliveira
              </span>
              <span>
                <FiClock size={20} />4 min
              </span>
            </div>
          </header>

          <div className={styles.postContent}>
            <h2>Proin et varius</h2>

            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

            <p>
              Nullam dolor sapien, vulputate eu diam at, condimentum hendrerit
              tellus. Nam facilisis sodales felis, pharetra pharetra lectus
              auctor sed.
            </p>

            <p>
              Ut venenatis mauris vel libero pretium, et pretium ligula
              faucibus. Morbi nibh felis, elementum a posuere et, vulputate et
              erat. Nam venenatis.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

// export const getStaticProps = async context => {
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID(TODO);

//   // TODO
// };
