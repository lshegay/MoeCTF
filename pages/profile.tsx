import React from 'react';
import { NextPage } from 'next';

import Context from '../app/models/context';
import Navigation from '../src/components/navigation';
import Footer from '../src/components/footer';
import PageProps from '../src/models/props/page';

import '../src/resources/stylesheet/main.scss';

const Page: NextPage<PageProps> = ({ user }) => (
  <>
    <Navigation className="masthead mb-5" currentNav="profile" user={user} />
    <main className="container">
      <div className="page-content mb-5">
        <h1>Profile</h1>
        <h3>{user.name}</h3>
        <h5>{`${user.points} Points`}</h5>
        <p>{user.content}</p>
      </div>
    </main>
    <Footer />
  </>
);

Page.getInitialProps = async ({ req }: Context): Promise<PageProps> => (
  {
    user: req.user,
  }
);

export default Page;
