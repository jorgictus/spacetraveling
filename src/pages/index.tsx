/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticPaths } from 'next';

import Link from 'next/link';
import { format } from 'date-fns';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const fecthNextPage = async () => {
    const response = await fetch(nextPage);
    return response.json();
  };

  const nextPageAction = async () => {
    const { results, next_page } = await fecthNextPage();
    setPosts(prev => prev.concat(results));
    setNextPage(next_page);
  };

  return (
    <>
      <Header />
      <div className={commonStyles.container}>
        <main className={styles.container}>
          <div className={styles.posts}>
            {posts.map(post => (
              <Link key={post.uid} href={`post/${post.uid}`}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.postInfo}>
                    <time>
                      <FiCalendar size={18} />{' '}
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy'
                      ).toLowerCase()}
                    </time>
                    <span>
                      <FiUser size={18} /> {post.data.author}
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
          {nextPage && (
            <button
              type="button"
              onClick={() => nextPageAction()}
              className={styles.loadMorePostsButton}
            >
              Carregar mais posts
            </button>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    { pageSize: 2 }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
