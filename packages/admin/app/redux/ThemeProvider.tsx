import React from 'react';
import { LightTheme, DarkTheme, BaseProvider, BaseProviderProps } from 'baseui';
import { useAppSelector } from '@redux/hooks';

type ThemeProviderProps = Omit<BaseProviderProps, 'theme'>

const ThemeProvider = ({ children, ...props }: ThemeProviderProps): JSX.Element => {
  const theme = useAppSelector((state) => state.site.theme);

  return (
    <BaseProvider theme={theme == 'light' ? LightTheme : DarkTheme} {...props}>
      {children}
    </BaseProvider>
  );
};

export default ThemeProvider;
