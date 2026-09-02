import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

/** Places the order and returns the receipt. */
export const placeOrder = createAsyncThunk(
  "orders/place",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders", payload);
      return data.order;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Could not place the order. Make sure the CookMe server is running."
      );
    }
  }
);

/** Receipt lookup — used by the receipt page and "Track my order". */
export const fetchOrder = createAsyncThunk(
  "orders/fetchOne",
  async (orderNumber, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${orderNumber}`);
      return data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Order not found");
    }
  }
);

/** Fetch orders belonging to the logged-in user. */
export const fetchMyOrders = createAsyncThunk(
  "orders/mine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/mine/list");
      return data.orders;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not load your orders"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    current: null,
    mine: [],
    placing: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearOrderError(state) {
      state.error = null;
    },
    clearCurrentOrder(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.placing = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placing = false;
        state.current = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placing = false;
        state.error = action.payload;
      })
      // Fetch Single Order
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.mine = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;