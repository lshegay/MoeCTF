import React from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { Provider as StyletronProvider } from 'styletron-react';
import { DarkTheme, BaseProvider } from 'baseui';
import { styletron } from '../styletron';

import 'normalize.css';
import '../fonts/main.scss';

const App: NextPage<AppProps> = ({ Component, pageProps }) => (
  <StyletronProvider value={styletron}>
    <BaseProvider theme={DarkTheme}>
      <Component {...pageProps} />
    </BaseProvider>
  </StyletronProvider>
);

export default App;
