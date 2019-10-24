import React from 'react';
import {
  Form,
  Input,
  Button,
  Collapse,
  Card,
  CardBody,
  CardTitle,
  FormGroup,
  Label,
  Jumbotron,
} from 'reactstrap';
import fetch from 'isomorphic-fetch';
import moment, { Moment, Duration } from 'moment';
import Navigation from '../src/components/Navigation';
import Footer from '../src/components/Footer';
import PageProps from '../src/interfaces/props/PostsProps';
import Post from '../src/interfaces/Post';

import config from '../server/Config';

import '../styles/main.scss';

interface PageStates {
  collapse: boolean;
  currentDate: Moment;
}


class Page extends React.PureComponent<PageProps, PageStates> {
  timer: NodeJS.Timeout;

  static async getInitialProps({ req }): Promise<PageProps> {
    const { protocol, hostname, port } = config;
    const host = hostname + (port ? `:${port}` : '');
    const pageRequest = `${protocol}//${host}/api/posts`;
    const respond = await fetch(pageRequest, { method: 'POST' });
    const json = await respond.json();

    const pageProps: PageProps = {
      posts: [],
      user: null,
      message: req.flash('error') || req.flash('message'),
    };

    if (req.isAuthenticated() && req.user) {
      pageProps.user = req.user;
    }

    json.posts.forEach((post) => {
      const newPost: Post = {
        id: post.post_id,
        title: post.post_title,
        content: post.post_content,
        date: post.post_date,
      };

      pageProps.posts.push(newPost);
    });

    return pageProps;
  }

  constructor(props: PageProps) {
    super(props);
    this.toggle = this.toggle.bind(this);

    this.state = {
      collapse: false,
      currentDate: moment(),
    };
  }

  componentDidMount(): void {
    this.timer = setInterval(() => {
      this.setState({
        currentDate: moment(),
      });
    }, 1000);
  }

  componentWillUnmount(): void {
    clearInterval(this.timer);
  }

  toggle(): void {
    this.setState((state) => ({ collapse: !state.collapse }));
  }

  render(): JSX.Element {
    const { posts, user, message } = this.props;
    const { collapse, currentDate } = this.state;
    const postsElements = [];

    let duration: Duration;
    if (currentDate.isBefore(config.startMatchDate)) {
      duration = moment.duration(config.startMatchDate.diff(currentDate));
    } else if (currentDate.isSameOrAfter(config.startMatchDate)) {
      duration = moment.duration(config.endMatchDate.diff(currentDate));
    }

    const timeLeft = `${duration.months() > 0 ? `${duration.months()} months ` : ''}${duration.days()} days `
      + `${duration.hours() < 10 ? '0' : ''}${duration.hours()}`
      + `:${duration.minutes() < 10 ? '0' : ''}${duration.minutes()}`
      + `:${duration.seconds() < 10 ? '0' : ''}${duration.seconds()}`;

    let adminPanel: JSX.Element;

    if (user && user.admin) {
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
                        <h3 className="mb-0">Create New Post</h3>
                      </CardTitle>
                      <Form action="/api/admin/create/post" method="POST" encType="multipart/form-data">
                        <FormGroup>
                          <Label>Post Title</Label>
                          <Input type="text" name="title" />
                        </FormGroup>
                        <FormGroup>
                          <Label>Content</Label>
                          <Input type="textarea" name="content" />
                        </FormGroup>
                        <p>{message}</p>
                        <Button>Create Post</Button>
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

    posts.forEach((post: Post) => {
      const {
        id, title, content, date,
      } = post;
      const textDate = moment(date);
      postsElements.push(
        <div className="blog-post" id={`post-${id}`} key={post.id}>
          <h2 className="blog-post-title">{title}</h2>
          {
            user && user.admin ? (
              <Form action="/api/admin/delete/post" method="POST">
                <Input type="hidden" name="id" value={id} />
                <Button className="close" aria-label="Close" style={{ color: 'white' }}>
                  <span aria-hidden="true">×</span>
                </Button>
              </Form>
            ) : ''
          }
          <p className="blog-post-meta">
            {textDate.fromNow()}
          </p>
          {content}
        </div>
      );
    });

    return (
      <>
        <Navigation className="masthead mb-5" user={user} />
        <main className="container">
          {adminPanel}
          {
            config.timer && (
              <div>
                <Jumbotron color="black" className="text-center">
                  {
                    currentDate.isBefore(config.startMatchDate) && (
                      <>
                        <h1 className="display-3 text-center">The game hasn&apos;t started yet</h1>
                        <h1 className="display-4 text-center">
                          {
                            `${timeLeft} left.`
                          }
                        </h1>
                        <p className="lead text-center">
                          {`Game starts in: ${config.startMatchDate.format('LL HH:mm:ss')}`}
                        </p>
                      </>
                    )
                  }
                  {
                    currentDate.isBetween(config.startMatchDate, config.endMatchDate) && (
                      <>
                        <h1 className="display-3 text-center">The game started</h1>
                        <h1 className="display-4 text-center">
                          {
                            `${timeLeft} left to finish.`
                          }
                        </h1>
                        <p className="lead text-center">
                          {
                            `Game finishes in: ${config.endMatchDate.format('LL HH:mm:ss')}`
                          }
                        </p>
                      </>
                    )
                  }
                  {
                    currentDate.isSameOrAfter(config.endMatchDate) && (
                      <>
                        <h1 className="display-3 text-center">The game is over</h1>
                        <h1 className="display-4 text-center">
                          Thanks everyone for taking a part in this game!
                        </h1>
                        <h3><a href="/scoreboard">View scoreboard!</a></h3>
                      </>
                    )
                  }
                </Jumbotron>
              </div>
            )
          }
          <div className="blog-name">
            <h3 className="pb-3 mb-4 font-italic border-bottom">News</h3>
            {postsElements}
          </div>
        </main>
        <Footer />
      </>
    );
  }
}

export default Page;
