import React from 'react';
import {
  Form,
  FormGroup,
  Input,
  Button,
  Label,
} from 'reactstrap';
import { NextPage } from 'next';

import Context from '../app/models/context';
import Navigation from '../src/components/navigation';
import Footer from '../src/components/footer';
import PageProps from '../src/models/props/page';

import '../src/resources/stylesheet/main.scss';

const Page: NextPage<PageProps> = ({ message }) => (
  <>
    <Navigation className="masthead mb-5" currentNav="register" />
    <main className="container mb-5">
      <h1>Регистрация</h1>
      <Form method="POST" action="/register">
        <FormGroup>
          <Label>Логин</Label>
          <Input type="text" name="username" />
        </FormGroup>
        <FormGroup>
          <Label>Почта</Label>
          <Input type="email" name="email" />
        </FormGroup>
        <FormGroup>
          <Label>Пароль</Label>
          <Input type="password" name="password" />
        </FormGroup>
        <FormGroup>
          <Label>Пароль еще раз</Label>
          <Input type="password" name="password2" />
        </FormGroup>
        <p>{ message }</p>
        <Button>Регистрация</Button>
      </Form>
    </main>
    <Footer />
  </>
);

Page.getInitialProps = async ({ req }: Context): Promise<PageProps> => ({
  user: null,
  message: req.flash('error'),
});

export default Page;
