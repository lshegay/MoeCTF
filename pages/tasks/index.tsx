import React from 'react';
import { NextPage } from 'next';
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  Badge,
  Jumbotron,
} from 'reactstrap';
import fetch from 'isomorphic-fetch';

import Context from '../../app/models/context';
import Navigation from '../../src/components/navigation';
import Footer from '../../src/components/footer';
import Panel from '../../src/components/admin';
import PageProps from '../../src/models/props/tasks';
import config from '../../app/settings/config';

import '../../src/resources/stylesheet/main.scss';

const Page: NextPage<PageProps> = ({
  tasks,
  categories,
  message,
  user,
  isGameEnded,
}) => {
  const categoriesElements: JSX.Element[] = [];
  const groupItemsElements: JSX.Element[] = [];
  let adminPanel: JSX.Element;

  if (user.admin) {
    categories.forEach((category) => {
      categoriesElements.push(
        <option value={category.id} key={category.id}>{category.name}</option>
      );
      groupItemsElements.push(
        <ListGroupItem id={`category-${category.id}`} key={category.id}>
          <Form action="/api/admin/delete/category" method="POST">
            {category.name}
            <Input type="hidden" name="id" value={category.id} />
            <Button className="close" aria-label="Close" style={{ color: 'white' }}>
              <span aria-hidden="true">×</span>
            </Button>
          </Form>
        </ListGroupItem>
      );
    });

    adminPanel = (
      <Panel>
        <div className="container">
          <div className="row">
            <div className="mb-4 col-md-6">
              <Card>
                <CardBody>
                  <CardTitle className="mb-3">
                    <h3 className="mb-0">Create New Task</h3>
                  </CardTitle>
                  <Form action="/api/admin/create" method="POST" encType="multipart/form-data">
                    <FormGroup>
                      <Label>Task Name</Label>
                      <Input type="text" name="name" />
                    </FormGroup>
                    <FormGroup>
                      <Label>Category</Label>
                      <Input type="select" name="category">
                        {categoriesElements}
                      </Input>
                    </FormGroup>
                    <FormGroup>
                      <Label>Description</Label>
                      <Input type="textarea" name="content" />
                    </FormGroup>
                    <FormGroup>
                      <Label>Task Points</Label>
                      <Input type="number" name="points" />
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
                    <Button>Create Task</Button>
                  </Form>
                </CardBody>
              </Card>
            </div>
            <div className="mb-4 col-md-6">
              <Card>
                <CardBody>
                  <CardTitle className="mb-3">
                    <h3 className="mb-0">Category Manager</h3>
                  </CardTitle>
                  <ListGroup className="mb-4">
                    {groupItemsElements}
                  </ListGroup>
                  <Form action="/api/admin/create/category" method="POST">
                    <FormGroup>
                      <Label>New Category Name</Label>
                      <Input type="text" name="name" />
                    </FormGroup>
                    <Button>Create Category</Button>
                  </Form>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  const tasksElements = tasks.map((task) => (
    <div className={`col-md-4 card-col ${task.solved ? '_solved' : ''}`} id={`task-${task.id}`} key={task.id}>
      <Card>
        <CardBody>
          <CardTitle className="mb-2">
            <h3 className="mb-0">
              <span className="mr-2">{task.name}</span>
              <Badge color="secondary">{task.points}</Badge>
            </h3>
            {
              user.admin ? (
                <Form action="/api/admin/delete" method="POST">
                  <Input type="hidden" name="id" value={task.id} />
                  <Button className="close" aria-label="Close" style={{ color: 'white' }}>
                    <span aria-hidden="true">×</span>
                  </Button>
                </Form>
              ) : ''
            }
          </CardTitle>
          <CardSubtitle className="text-muted mb-3">{task.categoryName}</CardSubtitle>
          <a href={`/tasks/${task.id}`}>Open Task</a>
        </CardBody>
      </Card>
    </div>
  ));

  return (
    <>
      <Navigation currentNav="tasks" className="mb-5" user={user} />
      <main className="container mb-5">
        {adminPanel}
        {
          isGameEnded && (
            <Jumbotron className="text-center">
              <h1 className="display-3 text-center">The game is over</h1>
              <h1 className="display-4 text-center">
                Thanks everyone for taking a part in this game!
              </h1>
              <h3><a href="/scoreboard">View scoreboard!</a></h3>
            </Jumbotron>
          )
        }
        <div className="row">
          {tasksElements}
        </div>
      </main>
      <Footer />
    </>
  );
};

Page.getInitialProps = async ({ req }: Context): Promise<PageProps> => {
  const {
    protocol,
    hostname,
    port,
    timer,
    endMatchDate,
  } = config;
  const host = hostname + (port ? `:${port}` : '');
  const pageRequest = `${protocol}//${host}/api/tasks`;
  const res = await fetch(pageRequest, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: req.headers.cookie
    },
  });
  const json = await res.json();

  const pageProps: PageProps = {
    tasks: json.tasks,
    categories: json.categories,
    message: req.flash('error'),
    user: req.user,
    isGameEnded: timer && Date.now() >= endMatchDate,
  };

  return pageProps;
};

export default Page;
