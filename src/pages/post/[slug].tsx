/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      alt: string;
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

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const timeToRead = post.data.content.reduce((a: any, b: any) => {
    return (
      a.heading.split(' ').length +
      b.heading.split(' ').length +
      RichText.asText(a.body).split(' ').length +
      RichText.asText(b.body).split(' ').length
    );
  });

  let postWithHtml = post;
  const content = postWithHtml.data.content.map(section => {
    return {
      heading: section.heading,
      body: { text: RichText.asHtml(section.body) },
    };
  });

  postWithHtml = {
    ...postWithHtml,
    data: {
      ...postWithHtml.data,
      content,
    },
  };

  return !router.isFallback ? (
    <>
      <Header />
      <img
        src={post.data.banner.url}
        className={styles.banner}
        alt={post.data.banner.alt}
      />

      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={styles.postInfo}>
            <time>
              <FiCalendar size={18} />
              {format(
                new Date(post.first_publication_date),
                'dd MMM yyyy'
              ).toLowerCase()}
            </time>
            <span>
              <FiUser size={18} /> {post.data.author}
            </span>
            <span>
              <FiClock size={18} /> {Math.ceil(timeToRead / 200)} min
            </span>
          </div>
          {post.data.content.map(section => (
            <>
              <h2>{section.heading}</h2>
              {section.body.map(item => (
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              ))}
            </>
          ))}
        </article>
      </main>
    </>
  ) : (
    <main className={commonStyles.container}>
      <p>Carregando...</p>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      subtitle: response.data.subtitle,
      title: response.data.title,
      author: response.data.author,
      banner: { url: response.data.banner.url },
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 60, // 1 Hora
  };
};
