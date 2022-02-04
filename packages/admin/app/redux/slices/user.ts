import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'moectf-core/models';

type UserState = User

const initialState = (): UserState => ({
  _id: null,
  admin: false,
  email: '',
  name: '',
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<UserState>) => {
      Object.assign(state, action.payload);
    },
    reset: (state) => {
      Object.assign(state, initialState());
    },
  },
});

export const { set, reset } = userSlice.actions;

export default userSlice.reducer;
