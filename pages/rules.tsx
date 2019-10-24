import React from 'react';
import Navigation from '../src/components/Navigation';
import Footer from '../src/components/Footer';
import PageProps from '../src/interfaces/props/PageProps';

import '../styles/main.scss';

class Rules extends React.PureComponent<PageProps> {
  static async getInitialProps({ req }): Promise<PageProps> {
    const props: PageProps = {
      user: null,
    };

    if (req.isAuthenticated()) {
      props.user = req.user;
    }

    return props;
  }

  render(): JSX.Element {
    const { user } = this.props;

    return (
      <>
        <Navigation className="masthead mb-5" currentNav="rules" user={user} />
        <main className="container">
          <div className="page-content mb-5">
            <h1>Rules</h1>
            <p>In the ass don&apos;t naruto run, but get a drink and chill</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }
}

export default Rules;
