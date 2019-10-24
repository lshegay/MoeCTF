import React from 'react';
import {
  Form,
  FormGroup,
  Input,
  Button,
  Label,
} from 'reactstrap';
import Navigation from '../src/components/Navigation';
import Footer from '../src/components/Footer';
import PageProps from '../src/interfaces/props/PageProps';

import '../styles/main.scss';


class Page extends React.PureComponent<PageProps> {
  static async getInitialProps({ req }): Promise<PageProps> {
    const props: PageProps = {
      user: null,
      message: req.flash('error'),
    };

    return props;
  }

  render(): JSX.Element {
    const { message } = this.props;

    return (
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
  }
}

export default Page;
