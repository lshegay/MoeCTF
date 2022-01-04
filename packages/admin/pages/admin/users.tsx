import React from 'react';
import NextLink from 'next/link';
import { Button, Link, Grid, Spacer, Text, Fieldset, Tag, Badge, Table } from '@geist-ui/react';
import IconPlus from '@geist-ui/react-icons/plus';
import Paperclip from '@geist-ui/react-icons/paperclip';
import { useRouter } from 'next/router';
import { css } from '@emotion/css';
import { GetServerSideProps } from 'next';
import get from '@funcs/get';
import { isAdmin } from '@funcs/user';
import { Task, User } from '@models/units';
import Header from '@components/header/Header';
import Container from '@components/Container';
import { Request } from '@utils/types';

type PageProps = {
  user: Partial<User>;
  tasks: Task[];
  users: User[];
};

const Page = ({ user, tasks, users }: PageProps): JSX.Element => {
  const router = useRouter();

  return (
    <>
      <Header user={user} />
      <div className={css('padding: 20px 0;')}>
        <Container />
        <Spacer h={1.5} />
        <Container>
          <Table data={users}>
            <Table.Column prop="_id" label="ID" width={200} />
            <Table.Column prop="name" label="Name" />
            <Table.Column prop="email" label="Email" />
          </Table>
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

  const users = await get.users({ db });
  const tasks = await get.tasks({ db });

  return ({
    props: {
      user,
      tasks,
      users,
    },
  });
};

export default Page;
