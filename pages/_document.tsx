import React from 'react';
import Document, { Html, Head, Main, NextScript, DocumentInitialProps } from 'next/document';
import { CssBaseline } from '@geist-ui/react';

const MyDocument = (): JSX.Element => (
  <Html>
    <Head />
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export const getServerSideProps = async (context): Promise<DocumentInitialProps> => {
  const initialProps = await Document.getInitialProps(context);
  const styles = CssBaseline.flush();

  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        {styles}
      </>
    ),
  };
};

export default MyDocument;
