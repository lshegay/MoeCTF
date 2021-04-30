/* eslint-disable prefer-destructuring */

import React, { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { Block } from 'baseui/block';
import { useStyletron } from 'baseui';
import { Display3, Paragraph1 } from 'baseui/typography';
import {
  workers,
  User,
  Task,
  Category,
} from 'moectf-core';
import { Formik } from 'formik';
import { FormControl } from 'baseui/form-control';
import { Tag, KIND, VARIANT } from 'baseui/tag';
import { Table } from 'baseui/table-semantic';
import { StyledLink } from 'baseui/link';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { useRouter } from 'next/router';
import { menuButtons } from '../../vars/global';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Background from '../../components/Background';
import Menu from '../../components/Menu';
import Header from '../../components/Header';
import Taskedit from '../../components/modal/Taskedit';

type PageProps = {
  startMatchDate: number,
  endMatchDate: number,
  user: User,
  task: Task & { solved: ({ date: number, user: User, points: number }[]) },
  category: Category,
  locale: string,
  domain: string,
};

const Page: NextPage<PageProps> = ({
  user,
  task,
  category,
  endMatchDate,
  startMatchDate,
  locale,
  domain,
}) => {
  const router = useRouter();
  const [solved, setSolved] = useState(task.solved.findIndex(((t) => t.userId == user._id)) > -1);
  const [css] = useStyletron();

  return (
    <>
      <Header title="FarEastCTF_" subtitle={category.name} hrefSubtitle={`/category/${category._id}`} />
      <FlexGrid
        padding="180px 60px"
        flexGridColumnCount={2}
        height="100%"
        flexGridColumnGap="20px"
      >
        <FlexGridItem
          overrides={{
            Block: {
              style: {
                width: '60%',
              },
            },
          }}
        >
          <Block
            className={css({
              border: '2px solid #FFEF04',
              padding: '40px',
              height: '100%',
            })}
          >
            <Display3
              overrides={{
                Block: {
                  style: {
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    fontFamily: 'Roboto Condensed',
                    marginBottom: '20px',
                  },
                },
              }}
            >
              {task.name}
            </Display3>
            <Tag kind={KIND.blue} variant={VARIANT.solid} closeable={false}>
              {category.name}
            </Tag>
            <Tag kind={KIND.yellow} variant={VARIANT.solid} closeable={false}>
              {task.points}
            </Tag>
            <Paragraph1
              overrides={{
                Block: {
                  style: {
                    color: '#ffffff',
                    fontFamily: 'Roboto Condensed',
                    marginBottom: '20px',
                    userSelect: 'text',
                  },
                },
              }}
            >
              {(() => {
                try {
                  return JSON.parse(task.content)[locale];
                } catch {
                  return task.content;
                }
              })()}
            </Paragraph1>
            {task.file && (
              <Paragraph1
                overrides={{
                  Block: {
                    style: {
                      color: '#ffffff',
                      fontFamily: 'Roboto Condensed',
                      marginBottom: '20px',
                    },
                  },
                }}
              >
                <span
                  className={css({
                    display: 'inline',
                    marginRight: '10px',
                  })}
                >
                  {{ 'ru-RU': 'Прикрепленный файл:', 'en-US': 'Attached file:' }[locale]}
                </span>
                <StyledLink
                  href={new URL(task.file.split('./public')[1], domain).toString()}
                  target="_blank"
                >
                  {task.file.split('/').reverse()[0]}
                </StyledLink>
              </Paragraph1>
            )}
            <Formik
              initialValues={{ flag: '' }}
              onSubmit={async (values, { setSubmitting, setErrors }) => {
                const response = await fetch(new URL('/api/submit', domain).toString(), {
                  method: 'POST',
                  body: JSON.stringify({
                    flag: values.flag.trim(),
                    taskId: task._id,
                  }),
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                });

                const res = await response.json();

                if (res.data?.message) {
                  setErrors({
                    flag: res.data?.message,
                  });
                }
                if (res.data.date) {
                  setSolved(true);
                }

                router.push(`/tasks/${task._id}`);

                setSubmitting(false);
              }}
            >
              {({
                errors,
                handleChange,
                handleSubmit,
                isSubmitting,
              }) => (
                <>
                  <FormControl
                    label={{ 'ru-RU': 'Введите флаг сюда', 'en-US': 'Insert flag here' }[locale]}
                    error={errors.flag}
                    overrides={{
                      Label: {
                        style: {
                          color: '#ffffff',
                        },
                      },
                    }}
                  >
                    <Input
                      name="flag"
                      onChange={handleChange}
                      disabled={solved || user.admin}
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    onClick={(e) => handleSubmit(e)}
                    disabled={solved || user.admin}
                  >
                    {solved
                      ? { 'ru-RU': 'Решено', 'en-US': 'Solved' }[locale]
                      : { 'ru-RU': 'Подтвердить', 'en-US': 'Submit' }[locale]}
                  </Button>
                </>
              )}
            </Formik>
          </Block>
        </FlexGridItem>
        <FlexGridItem
          overrides={{
            Block: {
              style: {
                width: '30%',
              },
            },
          }}
        >
          <Block>
            <Table
              columns={{ 'ru-RU': ['Команда', 'Время', 'Очки'], 'en-US': ['Team', 'Time', 'Points'] }[locale]}
              data={task.solved.map((s: any) => [
                s.user.name,
                new Date(s.date).toLocaleString(),
                s.points,
              ])}
              overrides={{
                Root: {
                  style: {
                    minHeight: '100px',
                  },
                },
              }}
            />
          </Block>
        </FlexGridItem>
      </FlexGrid>
      <Menu
        domain={domain}
        list={menuButtons}
        user={user}
        endMatchDate={endMatchDate}
        startMatchDate={startMatchDate}
        locale={locale}
        modalContent={(
          <Taskedit
            category={category}
            task={task}
            domain={domain}
          />
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

  const taskRes = await workers.get.task(db)({ ...req, params: { _id: query.tid } });
  const categoriesRes = await workers.get.categories(db)();
  const usersRes = await workers.get.users(db)();

  if (taskRes.status == 'fail') {
    throw taskRes.data?.message;
  }
  if (categoriesRes.status == 'fail') {
    throw categoriesRes.data?.message;
  }
  if (usersRes.status == 'fail') {
    throw usersRes.data?.message;
  }

  const task: Task = taskRes.data.task;
  const categories: Category[] = categoriesRes.data.categories;
  const users: User[] = usersRes.data.users;

  const usersMap = {};
  users.forEach((u) => {
    usersMap[u._id] = u;
  });

  const props: PageProps = {
    startMatchDate: startMatchDate ?? null,
    endMatchDate: endMatchDate ?? null,
    user: user ?? null,
    category: categories.find((category) => (category._id == task.categoryId)),
    task: {
      ...task,
      solved: task.solved
        .sort((s1, s2) => s1.date - s2.date)
        .map(({ date, userId }, index) => ({
          userId,
          date,
          user: usersMap[userId],
          points: task.points - task.points * index * (config.dynamicPoints ?? 0),
        })),
    },
    locale,
    domain,
  };

  return ({ props });
};

export default Page;
