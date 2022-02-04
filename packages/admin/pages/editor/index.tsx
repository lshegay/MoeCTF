import React from 'react';
import { Fieldset, Divider, Grid } from '@geist-ui/react';
import { css } from '@emotion/css';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import get from '@funcs/get';
import { isAdmin } from '@funcs/user';
import { Task, User } from '@models/units';
import Header from '@components/header/Header';
import Container from '@components/Container';
import { useEditor } from '@components/etc/Editor';
import TaskForm from '@components/editor/TaskForm';
import type { Request } from '@utils/types';
import 'whatwg-fetch';

const Editor = dynamic(() => import('@components/etc/Editor'), { ssr: false });
const Toolbar = dynamic(() => import('@components/etc/Toolbar'), { ssr: false });

type PageProps = {
  user: Partial<User>;
  task: Partial<Task>;
  minPoints: number;
  maxPoints: number;
}

const Page = ({ user, task, minPoints, maxPoints }: PageProps): JSX.Element => {
  const { editorState, setEditorState } = useEditor(task.content);

  return (
    <>
      <div className={css('background-color: #fafafa; min-height: 100%; height: auto; padding-bottom: 20px; box-sizing: border-box;')}>
        <Header user={user} />
        <div
          className={css(`
            box-shadow: inset 0 -1px #eaeaea;
            padding: 20px 0;
            background-color: white;
          `)}
        >
          <Container>
            <Toolbar editorState={editorState} setEditorState={setEditorState} />
          </Container>
        </div>
        <div className={css('margin: 20px 0;')}>
          <Container>
            <Grid.Container justify="space-between" alignItems="flex-start">
              <Grid xs={15}>
                <Fieldset width="100%">
                  <Editor
                    editorState={editorState}
                    setEditorState={setEditorState}
                  />
                  <Fieldset.Footer>
                    Task&apos;s description
                  </Fieldset.Footer>
                </Fieldset>
              </Grid>
              <Grid xs={8}>
                <Fieldset width="100%">
                  <Fieldset.Title
                    className={css('padding: 20.8px;')}
                  >
                    Task Information
                  </Fieldset.Title>
                  <Divider my={0} />
                  <Fieldset.Content>
                    <TaskForm
                      task={task}
                      minPoints={minPoints}
                      maxPoints={maxPoints}
                      editorState={editorState}
                    />
                  </Fieldset.Content>
                </Fieldset>
              </Grid>
            </Grid.Container>
          </Container>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ req, query }) => {
  const { db, config: { minPoints, maxPoints } } = req as Request;
  const _id = query.tid;
  const user = await get.profile({ req }) ?? {};

  if (!isAdmin({ req })) {
    return {
      redirect: {
        destination: '/login',
        permanent: true,
      }
    };
  }

  const task = await get.task({ db, _id }) ?? {};

  return ({
    props: {
      user,
      task,
      minPoints,
      maxPoints,
    },
  });
};

export default Page;
