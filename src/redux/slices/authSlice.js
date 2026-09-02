import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

const USER_KEY = "cookme-user";
const TOKEN_KEY = "cookme-token";

const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

const persist = (user, token) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/register", payload);
      persist(data.user, data.token);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Could not create the account");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/login", payload);
      persist(data.user, data.token);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Could not sign in");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: { user: loadUser(), loading: false, error: null },
  reducers: {
    logout(state) {
      state.user = null;
      try {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* ignore */
      }
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    [registerUser, loginUser].forEach((thunk) => {
      b.addCase(thunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
        .addCase(thunk.fulfilled, (s, a) => {
          s.loading = false;
          s.user = a.payload;
        })
        .addCase(thunk.rejected, (s, a) => {
          s.loading = false;
          s.error = a.payload;
        });
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
