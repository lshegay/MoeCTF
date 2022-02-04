import React from 'react';
import NextLink from 'next/link';
import { Button, Link, Grid, Spacer, Text, Fieldset, Tag, Badge } from '@geist-ui/react';
import IconPlus from '@geist-ui/react-icons/plus';
import Paperclip from '@geist-ui/react-icons/paperclip';
import { useRouter } from 'next/router';
import { css } from '@emotion/css';
import { GetServerSideProps } from 'next';
import { Request } from '@utils/types';
import { isAdmin } from '@funcs/user';
import get from '@funcs/get';
import { Task, User } from '@models/units';
import Header from '@components/header/Header';
import Container from '@components/Container';

type PageProps = {
  user: Partial<User>;
  tasks: Task[];
}

const Page = ({ user, tasks }: PageProps): JSX.Element => {
  const router = useRouter();

  return (
    <>
      <div className={css(`
        background-color: #fafafa;
        min-height: 100%;
        padding-bottom: 20px;
        box-sizing: border-box;
      `)}>
        <Header user={user} />
        <div
          className={css(`
            box-shadow: inset 0 -1px #eaeaea;
            padding: 40px 0;
            background-color: white;
          `)}
        >
          <Container>
            <Text h2 margin="0">Scoreboard</Text>
            <Button type="secondary" onClick={(): void => { router.push('/admin/editor'); }}>
              <IconPlus size={16} />
              <Spacer inline w={0.35} />
            </Button>
          </Container>
        </div>
        <Spacer h={1.5} />
        <Container>
          
        </Container>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ req }) => {
  const { db } = req as Request;
  const user: Partial<User> = await get.profile({ req }) ?? {};

  if (!isAdmin({ req })) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: true,
      }
    };
  }

  const tasks = await get.tasks({ db });

  return ({
    props: {
      user,
      tasks,
    },
  });
};

export default Page;
