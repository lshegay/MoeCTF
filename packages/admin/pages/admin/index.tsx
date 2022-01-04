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
};

const Page = ({ user, tasks }: PageProps): JSX.Element => {
  const router = useRouter();

  return (
    <>
      <Header user={user} />
      <div className={css()}>
        <div
          className={css(`
            box-shadow: inset 0 -1px #eaeaea;
            padding: 40px 0;
            background-color: white;
          `)}
        >
          <Container>
            <Text h2 margin="0">Tasks</Text>
            <Button type="secondary" onClick={(): void => { router.push('/admin/editor'); }}>
              <IconPlus size={16} />
              <Spacer inline w={0.35} />
              New Task
            </Button>
          </Container>
        </div>
        <Spacer h={1.5} />
        <Container>
          <Grid.Container gap={2}>
            {tasks.map((task) => (
              <Grid xs={8} key={task._id}>
                <Fieldset width="100%">
                  <Fieldset.Content>
                    <NextLink passHref href={`/admin/editor?tid=${task._id}`}>
                      <Link underline><Text h5>{task.name}</Text></Link>
                    </NextLink>
                    <Fieldset.Subtitle className={css('word-break: break-all; margin: 0 !important; height: 44px;')}>
                      {
                        task.content.length > 50
                          ? `${task.content.trim().substring(0, 50)}...`
                          : task.content
                      }
                    </Fieldset.Subtitle>
                    <Spacer w={0.5} />
                    <div className={css('display: flex;')}>
                      {task.tags.map((tag) => (
                        <React.Fragment key={tag}>
                          <Tag type="lite">{tag}</Tag>
                          <Spacer w={0.5} />
                        </React.Fragment>
                      ))}
                    </div>
                  </Fieldset.Content>
                  <Fieldset.Footer>
                    <div
                      className={css(`
                        display: flex;
                        align-items: center;
                        height: 100%;
                      `)}
                    >
                      <Badge scale={1 / 3} type="secondary">{task.points}</Badge>
                      <Spacer w={0.5} />
                      {task.file && (
                        <Paperclip size={14} />
                      )}
                    </div>
                    <Button
                      auto
                      scale={1 / 3}
                      onClick={(): unknown => router.push(`/admin/editor?tid=${task._id}`)}
                    >
                      Edit Task
                    </Button>
                  </Fieldset.Footer>
                </Fieldset>
              </Grid>
            ))}
          </Grid.Container>
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
