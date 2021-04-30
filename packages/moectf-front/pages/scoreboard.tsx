/* eslint-disable prefer-destructuring */
import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { Block } from 'baseui/block';
import { workers, User, Task } from 'moectf-core';
import { Table } from 'baseui/table-semantic';
import { menuButtons } from '../vars/global';
import Background from '../components/Background';
import Menu from '../components/Menu';
import Header from '../components/Header';
import Scoreboard from '../components/modal/Scoreboard';

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
        <Scoreboard ctfTime={ctfTime} />
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

  const tasksRes = await workers.get.tasks(db)();
  const usersRes = await workers.get.users(db)();

  if (tasksRes.status == 'fail') {
    throw tasksRes.data?.message;
  }
  if (usersRes.status == 'fail') {
    throw usersRes.data?.message;
  }

  const tasks: Task[] = tasksRes.data.tasks;
  const users: User[] = usersRes.data.users;

  const tasksList = tasks.map((task) => {
    const solvedMap = {};
    task.solved
      .sort((s1, s2) => s1.date - s2.date)
      .forEach((s, index) => {
        solvedMap[s.userId] = { date: s.date, index };
      });

    return ({
      ...task,
      solved: solvedMap,
    });
  });

  const usersList = users
    .flatMap((u) => {
      const solvedTasks = tasksList
        .flatMap((task) => {
          const hasSolved = task.solved[u._id];

          if (!hasSolved) return ([]);

          return ([{
            ...task,
            solvedDate: hasSolved.date,
            solvedPoints: task.points - task.points * hasSolved.index * (config.dynamicPoints ?? 0),
          }]);
        });

      const info = solvedTasks.reduce(({ points, dateTime }, task) => ({
        points: points + task.solvedPoints,
        dateTime: dateTime + task.solvedDate,
      }), { points: 0, dateTime: 0 });

      if (u.admin && info.points == 0) return ([]);

      return ([{
        ...u,
        points: info.points,
        dateTime: info.dateTime,
        tasks: solvedTasks,
      }]);
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
      tasks: tasks.map((t) => t.name),
      standings: usersList.map((u, index) => {
        const taskStats = {};
        u.tasks
          .forEach((t) => {
            taskStats[t.name] = {
              time: t.solvedDate,
              points: t.solvedPoints,
            };
          });

        return ({
          pos: index + 1,
          team: u.name,
          score: u.points,
          ...(u.tasks.length > 0 && {
            lastAccept: u.tasks[u.tasks.length - 1].solvedDate,
            taskStats,
          }),
        });
      }),
    },
  };

  return ({ props });
};

export default Page;
