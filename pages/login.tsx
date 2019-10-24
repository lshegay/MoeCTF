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
  }
}

export default Page;
