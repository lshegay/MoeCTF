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
import moment from 'moment';
import { IoIosCash } from 'react-icons/io';

import Navigation from '../../src/components/Navigation';
import Footer from '../../src/components/Footer';
import PageProps from '../../src/interfaces/props/TasksProps';
import Task from '../../src/interfaces/Task';
import config from '../../server/Config';

import '../../styles/main.scss';


interface PageStates {
  collapse: boolean;
}

interface CoinsTask extends Task {
  hintPrice: number;
  hintContent: string;
  profit: number;
}

class Page extends React.PureComponent<PageProps, PageStates> {
  static async getInitialProps({ query, req }): Promise<PageProps> {
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

    if (req.user.admin) {
      const pageRequestCoins = `${protocol}//${host}/api/admin/hint?id=${query.task_id}`;
      const resCoins = await fetch(pageRequestCoins, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: req.headers.cookie
        },
      });

      const jsonCoins = await resCoins.json();

      if (jsonCoins.price) {
        json.task.hintPrice = jsonCoins.price;
        json.task.hintContent = jsonCoins.content;
        json.task.profit = jsonCoins.taskProfit;
      }
    } else {
      const pageRequestCoins = `${protocol}//${host}/api/hint?id=${query.task_id}`;
      const resCoins = await fetch(pageRequestCoins, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: req.headers.cookie
        },
      });

      const jsonCoins = await resCoins.json();

      if (jsonCoins.price) {
        json.task.hintPrice = jsonCoins.price;
        json.task.profit = jsonCoins.taskProfit;
      }
    }

    const pageProps: PageProps = {
      tasks: [json.task],
      categories: json.categories,
      user: req.user,
      message: req.flash('error') || req.flash('message'),
      isGameEnded: timer && !req.user.admin && moment().isSameOrAfter(endMatchDate),
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
    const task = tasks[0];
    const fileElement = task.file
      // eslint-disable-next-line react/jsx-one-expression-per-line
      ? (<p>Файл: <a href={`/${task.file}`}>{ task.file }</a></p>) : '';
    const inputElementAttrs = {
      disabled: task.solved ? true : isGameEnded,
      ...(isGameEnded && { value: 'Game has ended!' }),
      ...(task.solved && { value: 'Solved!' }),
    };
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
                <div className="mb-4 col-md-6">
                  <Card>
                    {(task as CoinsTask).hintPrice ? (
                      <CardBody>
                        <CardTitle className="mb-3">
                          <h3 className="mb-0">Hint Manager</h3>
                        </CardTitle>
                        <Form action="/api/admin/update/hint" method="POST" encType="multipart/form-data">
                          <Input type="hidden" value={task.id} name="taskId" />
                          <FormGroup>
                            <Label>Hint Price</Label>
                            <Input type="number" name="price" defaultValue={(task as CoinsTask).hintPrice.toString()} />
                          </FormGroup>
                          <FormGroup>
                            <Label>Hint Content</Label>
                            <Input type="text" name="content" defaultValue={(task as CoinsTask).hintContent} />
                          </FormGroup>
                          <FormGroup>
                            <Label>Task Profit</Label>
                            <Input type="number" name="taskProfit" defaultValue={(task as CoinsTask).profit.toString()} />
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
                </div>
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
              <Badge color="secondary" className="mr-2">{task.points}</Badge>
              {((task as CoinsTask).profit && (
                <Badge color="success">
                  {(task as CoinsTask).profit}
                  <IoIosCash style={{ width: '0.8em', height: '0.8em', marginLeft: 3 }} />
                </Badge>
              ))}
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
  }
}

export default Page;
