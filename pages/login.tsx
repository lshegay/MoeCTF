import React from 'react';
import { NextPage } from 'next';
import {
  Form,
  FormGroup,
  Input,
  Button,
  Label,
} from 'reactstrap';

import Context from '../app/models/context';
import Navigation from '../src/components/navigation';
import Footer from '../src/components/footer';
import PageProps from '../src/models/props/page';

import '../src/resources/stylesheet/main.scss';

const Page: NextPage<PageProps> = ({ message }) => (
  <>
    <Navigation className="masthead mb-5" currentNav="login" />
    <main className="container mb-5">
      <h1>Авторизация</h1>
      <Form method="POST" action="/login">
        <FormGroup>
          <Label>Логин</Label>
          <Input type="text" name="username" />
        </FormGroup>
        <FormGroup>
          <Label>Пароль</Label>
          <Input type="password" name="password" />
        </FormGroup>
        <p>{ message }</p>
        <Button type="submit">Авторизация</Button>
      </Form>
    </main>
    <Footer />
  </>
);

Page.getInitialProps = async ({ req }: Context): Promise<PageProps> => (
  {
    user: null,
    message: req.flash('error'),
  }
);

export default Page;
