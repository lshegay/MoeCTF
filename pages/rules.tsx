import React from 'react';
import { NextPage } from 'next';

import Context from '../app/models/context';
import Navigation from '../src/components/navigation';
import Footer from '../src/components/footer';
import PageProps from '../src/models/props/page';

import '../src/resources/stylesheet/main.scss';

const Page: NextPage<PageProps> = ({ user }) => (
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

Page.getInitialProps = async ({ req }: Context): Promise<PageProps> => (
  {
    user: req.isAuthenticated() && req.user,
  }
);

export default Page;
