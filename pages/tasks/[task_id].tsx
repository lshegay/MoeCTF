import React from 'react';
import { NextPage } from 'next';
import {
  Form,
  FormGroup,
  Button,
  Card,
  CardTitle,
  CardBody,
  Label,
  Input,
  Badge,
} from 'reactstrap';
import fetch from 'isomorphic-fetch';

import Context from '../../app/models/context';
import { Navigation, Footer, Panel } from '../../src/components';
import TasksProps from '../../src/models/props/tasks';
import config from '../../app/settings/config';

import '../../src/resources/stylesheet/main.scss';

const Page: NextPage<TasksProps> = ({
  tasks,
  categories,
  message,
  user,
  isGameEnded,
}) => {
  const task = tasks[0];
  const fileElement = task.file
    // eslint-disable-next-line react/jsx-one-expression-per-line
    ? (<p>Файл: <a href={`/${task.file}`}>{ task.file }</a></p>) : '';
  const inputElementAttrs = {
    disabled: task.solved ? true : isGameEnded,
    ...(isGameEnded && { value: 'Game has ended!' }),
    ...(task.solved && { value: 'Solved!' }),
  };

  let adminPanel: JSX.Element;

  if (user.admin) {
    const categoriesElements = categories.map((category) => (
      <option value={category.id} key={category.id}>{category.name}</option>
    ));

    adminPanel = (
      <Panel>
        <div className="container">
          <div className="row">
            <div className="mb-4 col-md-6">
              <Card>
                <CardBody>
                  <CardTitle className="mb-3">
                    <h3 className="mb-0">Edit Task</h3>
                  </CardTitle>
                  <Form action="/api/admin/update" method="POST" encType="multipart/form-data">
                    <Input type="hidden" value={task.id} name="id" />
                    <FormGroup>
                      <Label>Task Name</Label>
                      <Input type="text" name="name" defaultValue={task.name} />
                    </FormGroup>
                    <FormGroup>
                      <Label>Category</Label>
                      <Input type="select" name="category" defaultValue={task.categoryId.toString()}>
                        {categoriesElements}
                      </Input>
                    </FormGroup>
                    <FormGroup>
                      <Label>Description</Label>
                      <Input type="textarea" name="content" defaultValue={task.content} />
                    </FormGroup>
                    <FormGroup>
                      <Label>Task Points</Label>
                      <Input type="number" name="points" defaultValue={task.points.toString()} />
                    </FormGroup>
                    <FormGroup>
                      <Label>File</Label>
                      <Input type="file" name="file" />
                    </FormGroup>
                    <FormGroup>
                      <Label>Task Flag</Label>
                      <Input type="text" name="flag" />
                    </FormGroup>
                    <p>{message}</p>
                    <Button>Update Task</Button>
                  </Form>
                </CardBody>
              </Card>
            </div>
            {/* <div className="mb-4 col-md-6">
              <Card>
                {task.hint ? (
                  <CardBody>
                    <CardTitle className="mb-3">
                      <h3 className="mb-0">Hint Manager</h3>
                    </CardTitle>
                    <Form action="/api/admin/update/hint" method="POST" encType="multipart/form-data">
                      <Input type="hidden" value={task.id} name="taskId" />
                      <FormGroup>
                        <Label>Hint Price</Label>
                        <Input type="number" name="price" defaultValue={task.hint.price.toString()} />
                      </FormGroup>
                      <FormGroup>
                        <Label>Hint Content</Label>
                        <Input type="text" name="content" defaultValue={task.hint.content} />
                      </FormGroup>
                      <FormGroup>
                        <Label>Task Profit</Label>
                        <Input type="number" name="taskProfit" defaultValue={task.profit.toString()} />
                      </FormGroup>
                      <Button className="mb-2">Update Hint</Button>
                    </Form>
                    <Form action="/api/admin/delete/hint" method="POST">
                      <Input type="hidden" value={task.id} name="taskId" />
                      <Button color="danger">Delete Hint</Button>
                    </Form>
                  </CardBody>
                ) : (
                  <CardBody>
                    <CardTitle className="mb-3">
                      <h3 className="mb-0">Hint Manager</h3>
                    </CardTitle>
                    <Form action="/api/admin/create/hint" method="POST" encType="multipart/form-data">
                      <Input type="hidden" value={task.id} name="taskId" />
                      <FormGroup>
                        <Label>Hint Price</Label>
                        <Input type="number" name="price" />
                      </FormGroup>
                      <FormGroup>
                        <Label>Hint Content</Label>
                        <Input type="text" name="content" />
                      </FormGroup>
                      <FormGroup>
                        <Label>Task Profit</Label>
                        <Input type="number" name="taskProfit" />
                      </FormGroup>
                      <Button>Create Hint</Button>
                    </Form>
                  </CardBody>
                )}
              </Card>
            </div> */}
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <Navigation currentNav="tasks" className="mb-5" user={user} />
      <main className="container mb-5">
        {adminPanel}
        <div className="page-content mb-5">
          <h1>
            <span className="mr-4">{task.name}</span>
            <Badge color="secondary" className="mr-2">{task.points}</Badge>
            {/* {((task as CoinsTask).profit && (
              <Badge color="success">
                {(task as CoinsTask).profit}
                <IoIosCash style={{ width: '0.8em', height: '0.8em', marginLeft: 3 }} />
              </Badge>
            ))} */}
          </h1>
          <h3 className="text-muted">{ task.categoryName }</h3>
          <div className="mb-4">
            {task.content}
          </div>
          { fileElement }
          <Form method="POST" action="/api/submit">
            <input type="hidden" name="task_id" value={task.id} />
            <FormGroup>
              <Input name="task_flag" {...inputElementAttrs} />
            </FormGroup>
            <p>{message}</p>
            <FormGroup>
              <Button name="task_submit" disabled={task.solved || isGameEnded}>
                Подтвердить
              </Button>
            </FormGroup>
          </Form>
        </div>
      </main>
      <Footer />
    </>
  );
};

Page.getInitialProps = async ({ req, query }: Context): Promise<TasksProps> => {
  const {
    protocol,
    hostname,
    port,
    timer,
    endMatchDate,
  } = config;
  const host = hostname + (port ? `:${port}` : '');
  const pageRequest = `${protocol}//${host}/api/tasks/${query.task_id}`;
  const res = await fetch(pageRequest, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: req.headers.cookie
    },
  });
  const json = await res.json();

  const pageProps: TasksProps = {
    tasks: [json.task],
    categories: json.categories,
    user: req.user,
    message: req.flash('error') || req.flash('message'),
    isGameEnded: timer && !req.user.admin && Date.now() >= endMatchDate,
  };

  return pageProps;
};

export default Page;
