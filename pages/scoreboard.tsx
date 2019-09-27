import React from 'react';
import { Table } from 'reactstrap';
import fetch from 'isomorphic-fetch';

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageProps from '../interfaces/props/ScoreboardProps';
import User from '../interfaces/User';

import config from '../server/config';

import '../styles/main.scss';

class Scoreboard extends React.PureComponent<PageProps> {
  static async getInitialProps({ req }): Promise<PageProps> {
    const { protocol, hostname, port } = config;
    const host = hostname + (port ? `:${port}` : '');
    const pageRequest = `${protocol}//${host}/api/users`;
    const respond = await fetch(pageRequest, { method: 'POST' });
    const json = await respond.json();

    const pageProps: PageProps = {
      user: req.user,
      users: json.users,
    };

    return pageProps;
  }

  render(): JSX.Element {
    const { user, users } = this.props;
    const usersElements = [];

    users.forEach((user, index) => {
      usersElements.push(
        <tr key={user.id}>
          <th scope="row">{index + 1}</th>
          <td>{user.name}</td>
          <td>{user.points}</td>
        </tr>
      );
    });

    return (
      <>
        <Navigation currentNav="scoreboard" className="mb-5" user={user} />
        <main className="container mb-5">
          <div className="row">
            <Table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>UserName</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {usersElements}
              </tbody>
            </Table>
          </div>
        </main>
        <Footer />
      </>
    );
  }
}

export default Scoreboard;
