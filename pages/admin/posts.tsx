import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import dynamic from 'next/dynamic';
import { Button, Link, Grid, Spacer, Text, Fieldset, Tag, Badge, Table, Card, Divider } from '@geist-ui/react';
import IconPlus from '@geist-ui/react-icons/plus';
import Paperclip from '@geist-ui/react-icons/paperclip';
import useSWR, { SWRConfig } from 'swr';
import { useRouter } from 'next/router';
import { css } from '@emotion/css';
import { GetServerSideProps } from 'next';
import Markdown from 'markdown-to-jsx';
import get from '@funcs/get';
import { isAdmin } from '@funcs/user';
import { Post, Task, User } from '@models/units';
import Header from '@components/header/Header';
import Container from '@components/Container';
import { Request } from '@utils/types';
import { Response } from '@utils/response';
import 'whatwg-fetch';

type PageProps = {
  user: Partial<User>;
  POST_LIMIT: number;
};

// eslint-disable-next-line max-len
const fetcher = (url: string): Promise<Response<{posts: Post[]}>> => window.fetch(url).then((r) => r.json());

const Page = ({ user, POST_LIMIT }: PageProps): JSX.Element => {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [posts, setPosts] = useState({ v: [], lastPage: false });
  const { data } = useSWR(`/api/posts?start=${pageIndex * POST_LIMIT}&limit=${POST_LIMIT}`, fetcher);

  useEffect(() => {
    if (data?.data?.posts != null) {
      if (pageIndex == 0) {
        setPosts(() => ({
          v: [...data.data.posts],
          lastPage: data?.data?.posts.length < 5,
        }));
        return;
      }

      setPosts((prevPosts) => ({
        v: [...prevPosts.v, ...data.data.posts],
        lastPage: data?.data?.posts.length < 5,
      }));
    }
  }, [data]);

  return (
    <>
      <div className={css(`
          background-color: #fafafa;
          min-height: 100%;
          padding-bottom: 20px;
          box-sizing: border-box;
        `)}
      >
        <Header user={user} />
        <div
          className={css(`
            box-shadow: inset 0 -1px #eaeaea;
            padding: 40px 0;
            background-color: white;
          `)}
        >
          <Container>
            <Text h2 margin="0">Announcements</Text>
            <Button type="secondary" onClick={(): void => { router.push('/admin/editor/posts'); }}>
              <IconPlus size={16} />
              <Spacer inline w={0.35} />
              New Post
            </Button>
          </Container>
        </div>
        <Container>
          <div className={css('padding: 40px 0; width: 100%;')}>
            <Text h4>Posts</Text>
            <Spacer h={1} />
            <div>
              {posts.v.map((post) => (
                <Fieldset key={post._id} width="100%" className={css('margin-bottom: 20px !important;')}>
                  <Fieldset.Content padding="20.8px">
                    <NextLink href={`/admin/editor/posts?pid=${post._id}`} passHref>
                      <Link underline color className={css('display: block !important;')}>
                        <Text b>{post.name}</Text>
                      </Link>
                    </NextLink>
                    <Text type="secondary" small>{new Date(post.date).toLocaleString()}</Text>
                  </Fieldset.Content>
                  <Divider margin="0" />
                  <Fieldset.Content padding="20.8px">
                    <Markdown>{post.content}</Markdown>
                  </Fieldset.Content>
                  <Fieldset.Footer>
                    <span />
                    <Button
                      auto
                      scale={1 / 3}
                      onClick={(): void => { router.push(`/admin/editor/posts?pid=${post._id}`); }}
                    >
                      Change Post
                    </Button>
                  </Fieldset.Footer>
                </Fieldset>
              ))}
              <Spacer h={2} />
              {!posts.lastPage && (
                <div className={css('width: 100%; text-align: center;')}>
                  <Button
                    type="success"
                    onClick={(): void => {
                      setPageIndex(pageIndex + 1);
                    }}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ req, query }) => {
  const { db } = req as Request;
  const user: Partial<User> = await get.profile({ req }) ?? {};
  const POST_LIMIT = 5;

  if (!isAdmin({ req })) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: true,
      }
    };
  }

  const posts = await get.posts({ db, start: 0, limit: POST_LIMIT });

  return ({
    props: {
      user,
      POST_LIMIT,
      fallback: {
        [`/api/posts?start=0&limit=${POST_LIMIT}`]: {
          posts,
        },
      },
    },
  });
};

const FallbackPage = ({ fallback, user, POST_LIMIT }): JSX.Element => (
  <SWRConfig value={{ fallback }}>
    <Page user={user} POST_LIMIT={POST_LIMIT} />
  </SWRConfig>
);

export default FallbackPage;
