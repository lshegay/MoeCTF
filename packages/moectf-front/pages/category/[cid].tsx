import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import {
  workers,
  User,
  Task,
  Category,
} from 'moectf-core';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { menuButtons } from '../../vars/global';
import Background from '../../components/Background';
import Menu from '../../components/Menu';
import Header from '../../components/Header';
import MainButton from '../../components/MainButton';
import Taskcreate from '../../components/modal/Taskcreate';

type PageProps = {
  startMatchDate: number,
  endMatchDate: number,
  user: User,
  tasks: Task[],
  category: Category,
  locale: string,
  domain: string,
};

const Page: NextPage<PageProps> = ({
  user,
  tasks,
  category,
  startMatchDate,
  endMatchDate,
  locale,
  domain,
}) => (
  <>
    <Header title="FarEastCTF_" subtitle={category.name} hrefSubtitle={`/category/${category._id}`} />
    <FlexGrid
      padding="180px 60px"
      flexGridColumnCount={[1, 1, 2, 3]}
      flexGridColumnGap="40px"
      flexGridRowGap="40px"
      height="100%"
    >
      {tasks.map((task) => (
        <FlexGridItem
          key={task._id}
        >
          <MainButton
            href={`/tasks/${encodeURIComponent(task._id)}`}
            points={task.points}
            tip={(task as any).solvedByUser && { 'ru-RU': 'Решено', 'en-US': 'Solved' }[locale]}
          >
            {task.name}
          </MainButton>
        </FlexGridItem>
      ))}
    </FlexGrid>
    <Menu
      domain={domain}
      list={menuButtons}
      user={user}
      endMatchDate={endMatchDate}
      startMatchDate={startMatchDate}
      locale={locale}
      modalContent={(
        <Taskcreate category={category} domain={domain} />
        )}
    />
    <Background />
  </>
);

export const getServerSideProps: GetServerSideProps = async ({ req, query, locale }) => {
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

  if (Date.now() < new Date(startMatchDate).getTime()) {
    return ({
      redirect: {
        permanent: false,
        destination: '/',
      },
    });
  }

  const tasks = await workers.get.tasks(db)();
  const categories = await workers.get.categories(db)();

  if (tasks.status == 'fail') {
    throw tasks.data?.message;
  }

  const props: PageProps = {
    startMatchDate: startMatchDate ?? null,
    endMatchDate: endMatchDate ?? null,
    user: user ?? null,
    category: categories.data.categories.filter((category) => category._id == query.cid)[0],
    tasks: tasks.data.tasks.filter((task) => task.categoryId == query.cid).map((task) => ({
      ...task,
      solvedByUser: task.solved.findIndex((s) => s.userId == user._id) > -1,
    })),
    locale,
    domain,
  };

  return ({ props });
};

export default Page;
