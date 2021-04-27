import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { workers, User, Category } from 'moectf-core';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import {
  ModalHeader,
  ModalBody,
} from 'baseui/modal';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { menuButtons } from '../vars/global';
import Background from '../components/Background';
import Menu from '../components/Menu';
import Header from '../components/Header';
import MainButton from '../components/MainButton';

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
}) => {
  const router = useRouter();

  return (
    <>
      <Header title="FarEastCTF_" />
      <FlexGrid
        padding="180px 60px"
        flexGridColumnCount={4}
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
          <>
            <ModalHeader>Добавление категорий</ModalHeader>
            <ModalBody>
              <Formik
                initialValues={{ name: '' }}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                  const response = await fetch(new URL('/api/admin/categories', domain).toString(), {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                  });

                  const res = await response.json();

                  if (res.status == 'fail') {
                    setErrors({
                      name: res.data.message,
                      ...res.data,
                    });
                  } else {
                    router.push('/');
                  }

                  setSubmitting(false);
                }}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  errors,
                  isSubmitting,
                }) => (
                  <>
                    <FormControl
                      label="Имя новой категории"
                      error={errors.name}
                    >
                      <Input
                        onChange={(e) => handleChange(e)}
                        onBlur={(e) => handleBlur(e)}
                        name="name"
                        required
                      />
                    </FormControl>
                    <Button
                      type="submit"
                      onClick={() => handleSubmit()}
                      isLoading={isSubmitting}
                    >
                      Добавить новую категории
                    </Button>
                  </>
                )}
              </Formik>
            </ModalBody>
          </>
          )}
      />
      <Background />
    </>
  );
};

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
