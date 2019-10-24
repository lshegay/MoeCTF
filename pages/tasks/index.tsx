import React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Button,
  Form,
  FormGroup,
  Collapse,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  Badge,
  Jumbotron,
} from 'reactstrap';
import fetch from 'isomorphic-fetch';
import moment from 'moment';
import Navigation from '../../src/components/Navigation';
import Footer from '../../src/components/Footer';
import PageProps from '../../src/interfaces/props/TasksProps';

import config from '../../server/Config';

import '../../styles/main.scss';


interface PageStates {
  collapse: boolean;
}

class Page extends React.PureComponent<PageProps, PageStates> {
  static async getInitialProps({ req }): Promise<PageProps> {
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
      isGameEnded: timer && moment().isSameOrAfter(endMatchDate),
    };

    return pageProps;
  }

  constructor(props: PageProps) {
    super(props);
    this.toggle = this.toggle.bind(this);

    this.state = {
      collapse: false,
    };
  }

  toggle(): void {
    this.setState((state) => ({ collapse: !state.collapse }));
  }

  render(): JSX.Element {
    const {
      tasks,
      categories,
      message,
      user,
      isGameEnded,
    } = this.props;
    const { collapse } = this.state;
    const tasksElements: JSX.Element[] = [];
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
        <div className="mb-4">
          <Button color="primary" onClick={this.toggle} className="mb-4 btn-block">Open Admin UI</Button>
          <Collapse isOpen={collapse}>
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
          </Collapse>
        </div>
      );
    }

    tasks.forEach((task) => {
      tasksElements.push(
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
      );
    });

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
  }
}

export default Page;
