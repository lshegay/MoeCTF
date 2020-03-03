import React from 'react';
import { NextPage } from 'next';
import {
  Form,
  Input,
  Button,
  Card,
  CardBody,
  CardTitle,
  FormGroup,
  Label,
} from 'reactstrap';
import fetch from 'isomorphic-fetch';

import Context from '../app/models/context';
import PageProps from '../src/models/props/posts';
import {
  Panel,
  Navigation,
  Footer,
  Dashboard,
} from '../src/components';
import { Post } from '../app/models';

import config from '../app/settings/config';

import '../src/resources/stylesheet/main.scss';

const Page: NextPage<PageProps> = ({
  posts,
  user,
  message,
}) => {
  const postsElements = posts.map((post: Post) => (
    <div className="blog-post" id={`post-${post.id}`} key={post.id}>
      <h2 className="blog-post-title">{post.title}</h2>
      {
        user && user.admin ? (
          <Form action="/api/admin/delete/post" method="POST">
            <Input type="hidden" name="id" value={post.id} />
            <Button className="close" aria-label="Close" style={{ color: 'white' }}>
              <span aria-hidden="true">×</span>
            </Button>
          </Form>
        ) : ''
      }
      <p className="blog-post-meta">
        {/* textDate.fromNow() */}
      </p>
      {post.content}
    </div>
  ));

  let adminPanel: JSX.Element;
  if (user && user.admin) {
    adminPanel = (
      <Panel>
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
      </Panel>
    );
  }

  return (
    <>
      <Navigation className="masthead mb-5" user={user} />
      <main className="container">
        {adminPanel}
        {
          config.timer && (
            <Dashboard
              startMatchDate={config.startMatchDate}
              endMatchDate={config.endMatchDate}
            />
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
};

Page.getInitialProps = async ({ req }: Context): Promise<PageProps> => {
  const { protocol, hostname, port } = config;
  const host = hostname + (port ? `:${port}` : '');
  const pageRequest = `${protocol}//${host}/api/posts`;
  const respond = await fetch(pageRequest, { method: 'POST' });
  const json = await respond.json();

  const pageProps: PageProps = {
    posts: json.posts,
    user: null,
    message: req.flash('error') || req.flash('message'),
    currentDate: Date.now(),
  };

  if (req.isAuthenticated()) {
    pageProps.user = req.user;
  }

  return pageProps;
};

export default Page;
