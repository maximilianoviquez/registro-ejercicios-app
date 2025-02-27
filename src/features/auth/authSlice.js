import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

// estado inicial
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// registro del usuario y valido tambien
export const registro = createAsyncThunk("auth/registro", async (userData, thunkAPI) => {
  try {
    return await authService.registro(userData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.mensaje || "Error al registrar");
  }
});

// login y manejo los eerrores
export const login = createAsyncThunk("auth/login", async (userData, thunkAPI) => {
  try {
    return await authService.login(userData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.mensaje || "Error al iniciar sesión");
  }
});

// logout  
export const logout = createAsyncThunk("auth/logout", async () => {
  authService.logout();
  return null;
});

// slice para autenticacion
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registro.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registro.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(registro.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.isLoading = false;
        state.message = "";
        localStorage.removeItem("user");
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;