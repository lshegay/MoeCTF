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
} from 'reactstrap';
import fetch from 'isomorphic-fetch';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageProps from '../interfaces/props/PostsProps';
import Post from '../interfaces/Post';

import config from '../server/config';

import '../styles/main.scss';

interface PageStates {
  collapse: boolean;
}

class Page extends React.PureComponent<PageProps, PageStates> {
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
    };
  }

  toggle(): void {
    this.setState((state) => ({ collapse: !state.collapse }));
  }

  render(): JSX.Element {
    const { posts, user, message } = this.props;
    const { collapse } = this.state;
    const postsElements = [];

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
      const textDate = new Date(parseInt(date, 10));
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
            {textDate.toUTCString()}
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
