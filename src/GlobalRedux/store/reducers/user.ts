import {
  createAction,
  createAsyncThunk,
  createReducer,
} from '@reduxjs/toolkit';
import axiosInstance from '../../../utils/axios';

interface UserState {
  username: string | null;
  message: string;
  isLogged: boolean;
  loading: boolean;
  sessionId: number | null;
}

const initialState: UserState = {
  username: null,
  isLogged: false,
  message: '',
  sessionId: null,
  loading: false,
};

export const login = createAsyncThunk(
  'user/login',
  async (formInput: FormData) => {
    const obj = Object.fromEntries(formInput);
    const response = await axiosInstance.post('/api/log/in', obj);
    return response;
  }
);

export const logout = createAction('user/logout');

const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(login.pending, (state, action) => {
      state.loading = true;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      const { id, username } = action.payload.data.session;
      state.isLogged = true;
      state.sessionId = id;
      state.username = username;
      sessionStorage.setItem('sessionId', id.toString());
      sessionStorage.setItem('username', username);
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.isLogged = false;
      state.sessionId = null;
      state.username = null;
    })
    .addCase(logout, (state) => {
      state.isLogged = false;
      state.sessionId = null;
      state.username = null;
      sessionStorage.clear();
      sessionStorage.clear();
    });
});

export default userReducer;
