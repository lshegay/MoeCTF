import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import {
  workers,
  User,
  Task,
  Category,
} from 'moectf-core';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';
import { Formik } from 'formik';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { useRouter } from 'next/router';
import { menuButtons } from '../../vars/global';
import Background from '../../components/Background';
import Menu from '../../components/Menu';
import Header from '../../components/Header';
import MainButton from '../../components/MainButton';

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
}) => {
  const router = useRouter();

  return (
    <>
      <Header title="FarEastCTF_" subtitle={category.name} hrefSubtitle={`/category/${category._id}`} />
      <FlexGrid
        padding="180px 60px"
        flexGridColumnCount={4}
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
          <>
            <ModalHeader>Добавление тасков</ModalHeader>
            <Formik
              initialValues={{
                name: '',
                contentRu: '',
                contentEn: '',
                flag: '',
                points: 0,
                file: null,
              }}
              onSubmit={async (values, { setSubmitting, setErrors }) => {
                const form = new FormData();
                Object.keys(values).forEach((key) => form.append(key, values[key]));
                form.append('categoryId', category._id);
                form.append('content', JSON.stringify({
                  'ru-RU': values.contentRu,
                  'en-US': values.contentEn,
                }));

                const response = await fetch(new URL('/api/admin/tasks', domain).toString(), {
                  method: 'POST',
                  body: form,
                  headers: {
                    Accept: 'application/json',
                  },
                });

                const res = await response.json();

                if (res.status == 'fail') {
                  setErrors({
                    file: res.data.message,
                    ...res.data,
                  });
                } else {
                  router.push(`/category/${category._id}`);
                }

                setSubmitting(false);
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                errors,
                setFieldValue,
                isSubmitting,
              }) => (
                <>
                  <ModalBody>
                    <FormControl
                      label="Имя"
                      error={errors.name}
                    >
                      <Input
                        onChange={(e) => handleChange(e)}
                        onBlur={(e) => handleBlur(e)}
                        name="name"
                        required
                      />
                    </FormControl>
                    <FormControl
                      label="Контент Русский"
                      error={errors.flag}
                    >
                      <Input
                        onChange={(e) => handleChange(e)}
                        onBlur={(e) => handleBlur(e)}
                        name="contentRu"
                        required
                      />
                    </FormControl>
                    <FormControl
                      label="Контент Английский"
                      error={errors.flag}
                    >
                      <Input
                        onChange={(e) => handleChange(e)}
                        onBlur={(e) => handleBlur(e)}
                        name="contentEn"
                        required
                      />
                    </FormControl>
                    <FormControl
                      label="Флаг"
                      error={errors.flag}
                    >
                      <Input
                        onChange={(e) => handleChange(e)}
                        onBlur={(e) => handleBlur(e)}
                        name="flag"
                        required
                      />
                    </FormControl>
                    <FormControl
                      label="Очки"
                      error={errors.points}
                    >
                      <Input
                        onChange={(e) => handleChange(e)}
                        onBlur={(e) => handleBlur(e)}
                        name="points"
                        type="number"
                        required
                      />
                    </FormControl>
                    <FormControl
                      label="Файл"
                      error={errors.file}
                    >
                      <input
                        name="file"
                        type="file"
                        onChange={(event) => {
                          setFieldValue('file', event.currentTarget.files[0]);
                        }}
                      />
                    </FormControl>
                  </ModalBody>
                  <ModalFooter>
                    <ModalButton
                      type="submit"
                      onClick={() => handleSubmit()}
                      isLoading={isSubmitting}
                    >
                      Добавить новый таск
                    </ModalButton>
                    <ModalButton
                      onClick={async () => {
                        const response = await fetch(new URL(`/api/admin/categories/${category._id}`, domain).toString(), {
                          method: 'DELETE',
                          headers: {
                            Accept: 'application/json',
                          },
                        });

                        await response.json();
                        await router.push('/');
                      }}
                      isLoading={isSubmitting}
                      overrides={{
                        BaseButton: {
                          style: {
                            backgroundColor: 'red',
                          },
                        },
                      }}
                    >
                      Удалить категорию
                    </ModalButton>
                  </ModalFooter>
                </>
              )}
            </Formik>
          </>
        )}
      />
      <Background />
    </>
  );
};

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
