import React from 'react';
import {
  Form,
  FormGroup,
  Button,
  Collapse,
  Card,
  CardTitle,
  CardBody,
  Label,
  Input,
  Badge,
} from 'reactstrap';
import fetch from 'isomorphic-fetch';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageProps from '../../interfaces/props/TasksProps';
import Task from '../../interfaces/Task';
import User from '../../interfaces/User';

import config from '../../server/config';

import '../../styles/main.scss';


interface PageStates {
  collapse: boolean;
}

class Page extends React.PureComponent<PageProps, PageStates> {
  static async getInitialProps({ query, req }): Promise<PageProps> {
    const { protocol, hostname, port } = config;
    const host = hostname + (port ? `:${port}` : '');
    const pageRequest = `${protocol}//${host}/api/tasks/${query.task_id}`;
    const res = await fetch(pageRequest, {
      method: 'POST',
      body: JSON.stringify({ userId: req.user.id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();

    const pageProps: PageProps = {
      tasks: [json.task],
      categories: json.categories,
      user: req.user,
      message: req.flash('error') || req.flash('message'),
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
    } = this.props;
    const { collapse } = this.state;
    const task = tasks[0];

    const fileElement = task.file
      // eslint-disable-next-line react/jsx-one-expression-per-line
      ? (<p>Файл: <a href={`/${task.file}`}>{ task.file }</a></p>) : '';

    const inputElement = task.solved
      ? (<Input name="task_flag" disabled={task.solved} value="Solved!" />)
      : (<Input name="task_flag" disabled={task.solved} />);

    const categoriesElements: JSX.Element[] = [];

    let adminPanel: JSX.Element;

    if (user.admin) {
      categories.forEach((category) => {
        categoriesElements.push(
          <option value={category.id} key={category.id}>{category.name}</option>
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
                          <Input type="text" name="points" defaultValue={task.points.toString()} />
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
                    <CardBody>
                      <CardTitle className="mb-3">
                        <h3 className="mb-0">Category Manager</h3>
                      </CardTitle>

                      <Form action="/api/admin/create/category" method="POST">
                        <FormGroup>
                          <Label>New Category Name</Label>
                          <Input type="text" name="name" />
                        </FormGroup>
                        <Button>Create Category</Button>
                      </Form>
                    </CardBody>
                  </Card>
                </div> */}
              </div>
            </div>
          </Collapse>
        </div>
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
              <Badge color="secondary">{task.points}</Badge>
            </h1>
            <h3 className="text-muted">{ task.categoryName }</h3>
            <div className="mb-4">
              {task.content}
            </div>
            { fileElement }
            <Form method="POST" action="/api/submit">
              <input type="hidden" name="task_id" value={task.id} />
              <FormGroup>
                {inputElement}
              </FormGroup>
              <p>{message}</p>
              <FormGroup>
                <Button name="task_submit" disabled={task.solved}>
                  Подтвердить
                </Button>
              </FormGroup>
            </Form>
          </div>
        </main>
        <Footer />
      </>
    );
  }
}

export default Page;
