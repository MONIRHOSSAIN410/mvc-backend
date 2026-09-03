import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";
import {
  createLocalAccount,
  findLocalAccount,
  clearLocalAccount,
} from "../../data/localAccount.js";

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
    localStorage.setItem(TOKEN_KEY, token || "");
  } catch {
    /* ignore */
  }
};

/**
 * True when the request never reached a working API.
 *
 * 404 counts: /users/register is a route the API definitely has, so a 404 on
 * it means the API is not wired up — not that anything is missing.
 */
const apiUnreachable = (err) => {
  const status = err.response?.status;
  return (
    !err.response ||
    err.code === "ECONNABORTED" ||
    status === 404 ||
    status === 503 ||
    status >= 500
  );
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/register", payload);
      persist(data.user, data.token);
      return data.user;
    } catch (err) {
      // No backend, or a backend with no database: keep a browser-only
      // profile so the shop can still be used. It is not a real account —
      // see src/data/localAccount.js.
      if (apiUnreachable(err)) {
        try {
          const user = createLocalAccount(payload);
          persist(user, "");
          return user;
        } catch (localErr) {
          return rejectWithValue(localErr.message);
        }
      }
      // The server answered — show what it actually said.
      return rejectWithValue(
        err.response?.data?.message || "Could not create the account"
      );
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
      if (apiUnreachable(err)) {
        const user = findLocalAccount(payload?.identifier);
        if (user) {
          persist(user, "");
          return user;
        }
        return rejectWithValue(
          "The CookMe server is not reachable, and no account has been created " +
            "in this browser yet. Please sign up first."
        );
      }
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
      state.error = null;
      try {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* ignore */
      }
      clearLocalAccount();
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
          s.error = null;
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
