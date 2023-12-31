import {
  createAction,
  createAsyncThunk,
  createReducer,
} from '@reduxjs/toolkit';
import { CountryCategories } from '../../../@types/countryCategories';
import axiosInstance from '../../../utils/axios';
import { AlertType } from '../../../@types/alert';

interface CountryState {
  category: CountryCategories | null;
  loading: boolean;
  infiniteLoading: boolean;
  alert: AlertType | null;
}

const initialState: CountryState = {
  category: null,
  loading: false,
  infiniteLoading: false,
  alert: null,
};

/**
 * Action to clear the alert for the graph.
 */
export const clearGraphAlert = createAction('planet/clearAlert');

/**
 * Async action to fetch graph data.
 */
export const fetchGraph = createAsyncThunk(
  'country/fetchGraph',
  async (countryId: string) => {
    try {
      const response = await axiosInstance.get(`/oworld/${countryId}/category`);
      return response;
    } catch (error: string | any) {
      throw new Error(error.response.data.message as string);
    }
  }
);

/**
 * Reducer for the graph.
 */
const graphReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchGraph.pending, (state) => {
      state.loading = true;
      state.infiniteLoading = true;
      state.alert = null;
    })
    .addCase(fetchGraph.fulfilled, (state, action) => {
      state.loading = false;
      state.infiniteLoading = false;
      state.category = action.payload.data;
    })
    .addCase(fetchGraph.rejected, (state, action) => {
      state.loading = false;
      state.infiniteLoading = true;
      state.alert = {
        type: 'error',
        message: action.error.message || 'Unknown error occurred.',
      };
    })
    .addCase(clearGraphAlert, (state) => {
      state.alert = null;
    });
});

export default graphReducer;
