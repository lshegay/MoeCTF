import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { workers, User, Category } from 'moectf-core';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { menuButtons } from '../vars/global';
import Background from '../components/Background';
import Menu from '../components/Menu';
import Header from '../components/Header';
import MainButton from '../components/MainButton';
import Categorycreate from '../components/modal/Categorycreate';

type PageProps = {
  startMatchDate: number,
  endMatchDate: number,
  user: User,
  categories: Category[],
  locale: string,
  domain: string,
};

const Page: NextPage<PageProps> = ({
  user,
  categories,
  startMatchDate,
  endMatchDate,
  locale,
  domain,
}) => (
  <>
    <Header title="FarEastCTF_" />
    <FlexGrid
      padding="180px 60px"
      flexGridColumnCount={[1, 1, 2, 3]}
      flexGridColumnGap="40px"
      flexGridRowGap="40px"
      height="100%"
    >
      {categories.map((category) => (
        <FlexGridItem
          key={category._id}
        >
          <MainButton href={`/category/${encodeURIComponent(category._id)}`}>
            {category.name}
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
        <Categorycreate domain={domain} />
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

  const categories = await workers.get.categories(db)();

  if (categories.status == 'fail') {
    throw categories.data?.message;
  }

  const props: PageProps = {
    startMatchDate: startMatchDate ?? null,
    endMatchDate: endMatchDate ?? null,
    user: user ?? null,
    categories: categories.data?.categories,
    locale,
    domain,
  };

  return ({ props });
};

export default Page;
