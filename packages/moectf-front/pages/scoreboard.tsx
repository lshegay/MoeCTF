import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { Block } from 'baseui/block';
import { workers, User } from 'moectf-core';
import { Table } from 'baseui/table-semantic';
import { menuButtons } from '../vars/global';
import Background from '../components/Background';
import Menu from '../components/Menu';
import Header from '../components/Header';

type PageProps = {
  startMatchDate: number,
  endMatchDate: number,
  user: User,
  users: any[],
  locale: string,
};

const Page: NextPage<PageProps> = ({
  user,
  users,
  startMatchDate,
  endMatchDate,
  locale,
}) => (
  <>
    <Header title="FarEastCTF_" subtitle="Таблица результатов" hrefSubtitle="/scoreboard" />
    <Block
      padding="180px 60px"
      height="100%"
    >
      <Table
        columns={{ 'ru-RU': ['Команда', 'Очки'], 'en-US': ['Team', 'Points'] }[locale]}
        data={users.map((u) => [u.name, u.points])}
        overrides={{
          Root: {
            style: {
              minHeight: '100px',
            },
          },
        }}
      />
    </Block>
    <Menu
      list={menuButtons}
      user={user}
      startMatchDate={startMatchDate}
      endMatchDate={endMatchDate}
      locale={locale}
    />
    <Background />
  </>
);

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
  const { config, user, db } = req as any;
  const { startMatchDate, endMatchDate } = config;

  if (!user) {
    return ({
      redirect: {
        permanent: false,
        destination: '/login',
      },
    });
  }

  const tasks = await workers.get.tasks(db)();
  const users = await workers.get.users(db)();

  if (tasks.status == 'fail') {
    throw tasks.data?.message;
  }
  if (users.status == 'fail') {
    throw users.data?.message;
  }

  const usersList = users.data.users
    .filter((u) => !u.admin)
    .map((u) => {
      const userTasks = tasks.data.tasks
        .map((t) => {
          const index = t.solved.findIndex((s) => s.userId == u._id);

          return ({
            ...t,
            solved: index > -1 ? t.solved[index] : null,
            solvedIndex: index,
          });
        })
        .filter((t) => t.solved);

      return ({
        ...u,
        points: userTasks
          .reduce((accumulator, t) => (
            accumulator + (t.points - t.points * t.solvedIndex * 0.01)
          ), 0),
        dateTime: userTasks
          .reduce((accumulator, t) => accumulator + t.solved.date, 0),
      });
    })
    .sort((user1, user2) => (
      user2.points == user1.points
        ? user1.dateTime - user2.dateTime
        : user2.points - user1.points
    ));

  const props: PageProps = {
    startMatchDate: startMatchDate ?? null,
    endMatchDate: endMatchDate ?? null,
    user: user ?? null,
    users: usersList,
    locale,
  };

  return ({ props });
};

export default Page;
