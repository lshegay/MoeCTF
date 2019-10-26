import React from 'react';
import Navigation from '../src/components/navigation';
import Footer from '../src/components/footer';
import PageProps from '../src/models/props/page';

import '../src/resources/stylesheet/main.scss';

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
