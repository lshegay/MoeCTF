import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageProps from '../interfaces/props/PageProps';
import User from '../interfaces/User';

import '../styles/main.scss';

class Profile extends React.PureComponent<PageProps> {
  static async getInitialProps({ req }): Promise<PageProps> {
    const props: PageProps = {
      user: req.user,
    };

    return props;
  }

  render(): JSX.Element {
    const { user } = this.props;

    return (
      <>
        <Navigation className="masthead mb-5" currentNav="profile" user={user} />
        <main className="container">
          <div className="page-content mb-5">
            <h1>Profile</h1>
            <h3>{ user.name }</h3>
            <p>In the ass don't naruto run, but get a drink and chill</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }
}

export default Profile;
