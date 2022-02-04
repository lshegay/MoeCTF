/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SiteState = {
  theme: 'light' | 'dark';
}

const initialState = (): SiteState => ({
  theme: 'light',
});

export const siteSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      if (action.payload == 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      state.theme = action.payload;
    },
    reset: (state) => {
      Object.assign(state, initialState());
    },
  },
});

export const { setTheme, reset } = siteSlice.actions;

export default siteSlice.reducer;
