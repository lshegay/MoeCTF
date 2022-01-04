import React from 'react';
import { GeistProvider, CssBaseline } from '@geist-ui/react';
import type { AppProps } from 'next/app';
import 'inter-ui/inter.css';
import '@fontsource/merriweather';

const Application = ({ Component, pageProps }: AppProps): JSX.Element => (
  <GeistProvider>
    <CssBaseline />
    <Component {...pageProps} />
  </GeistProvider>
);

export default Application;
