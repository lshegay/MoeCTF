import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { Block } from 'baseui/block';
import { workers, User } from 'moectf-core';
import { Table } from 'baseui/table-semantic';
import {
  ModalHeader,
  ModalBody,
} from 'baseui/modal';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
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
  domain: string,
  ctfTime: any,
};

const Page: NextPage<PageProps> = ({
  user,
  users,
  startMatchDate,
  endMatchDate,
  locale,
  domain,
  ctfTime,
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
      domain={domain}
      list={menuButtons}
      user={user}
      startMatchDate={startMatchDate}
      endMatchDate={endMatchDate}
      locale={locale}
      modalContent={(
        <>
          <ModalHeader>Добавление категорий</ModalHeader>
          <ModalBody>
            <FormControl
              label="CTFTime инфа"
            >
              <Textarea
                value={JSON.stringify(ctfTime)}
                size="large"

              />
            </FormControl>
          </ModalBody>
        </>
      )}
    />
    <Background />
  </>
);

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
  const { config, user, db } = req as any;
  const { startMatchDate, endMatchDate, domain } = config;

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
        .filter((t) => t.solved)
        .sort((t1, t2) => t1.solved.date - t2.solved.date);

      return ({
        ...u,
        points: userTasks
          .reduce((accumulator, t) => (
            accumulator + (t.points - t.points * t.solvedIndex * 0.01)
          ), 0),
        dateTime: userTasks
          .reduce((accumulator, t) => accumulator + t.solved.date, 0),
        tasks: userTasks,
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
    domain,
    ctfTime: {
      tasks: tasks.data.tasks.map((t) => t.name),
      standings: usersList.map((u, index) => {
        const taskStats = {};
        u.tasks
          .forEach((t) => {
            taskStats[t.name] = {
              time: t.solved.date,
              points: t.points - t.points * t.solvedIndex * 0.01,
            };
          });

        return ({
          pos: index + 1,
          team: u.name,
          score: u.points,
          taskStats,
          lastAccept: u.tasks[u.tasks.length - 1].solved.date,
        });
      }),
    },
  };

  return ({ props });
};

export default Page;
