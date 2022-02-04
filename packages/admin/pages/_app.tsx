import React from 'react';
import { AppProps } from 'next/app';
import { Provider as StyletronProvider } from 'styletron-react';
import { styletron } from '@utils/styletron';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from '@redux/store';
import ThemeProvider from '@app/redux/ThemeProvider';
import { FullscreenLoader } from '@app/components/DefaultBlocks';
import '@styles/main.css';

const Application = ({ Component, pageProps }: AppProps): JSX.Element => (
  <Provider store={store}>
    <StyletronProvider value={styletron}>
      <ThemeProvider>
        <PersistGate loading={<FullscreenLoader />} persistor={persistor}>
          <Component {...pageProps} />
        </PersistGate>
      </ThemeProvider>
    </StyletronProvider>
  </Provider>
);

export default Application;
