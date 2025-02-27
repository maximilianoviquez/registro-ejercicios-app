import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import registroService from "./registroService";

// obtengo registros guardados en localStorage
const obtenerRegistrosDesdeLocalStorage = (idUser) => {
  try {
    const registrosGuardados = JSON.parse(localStorage.getItem(`registros_${idUser}`)) || [];
    return registrosGuardados;
  } catch (error) {
    console.error("Error al recuperar registros de localStorage:", error);
    return [];
  }
};

const initialState = {
  registros: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// obtengo registros del usuario
export const obtenerRegistros = createAsyncThunk("registros/obtener", async (data, thunkAPI) => {
  try {
    const { token, idUser } = data;
    const response = await registroService.obtenerRegistros(token, idUser);

    if (response && response.registros) {
      localStorage.setItem(`registros_${idUser}`, JSON.stringify(response.registros));
      return response.registros;
    }

    return obtenerRegistrosDesdeLocalStorage(idUser);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || "Error al obtener registros");
  }
});

// agrego registro
export const agregarRegistro = createAsyncThunk("registros/agregar", async (data, thunkAPI) => {
  try {
    const { token, idUser, registroData } = data;
    const response = await registroService.agregarRegistro(token, idUser, registroData);

    if (!response || !response.idRegistro) {
      throw new Error("Error al agregar registro.");
    }

    const registrosActualizados = [...obtenerRegistrosDesdeLocalStorage(idUser), response];
    localStorage.setItem(`registros_${idUser}`, JSON.stringify(registrosActualizados));

    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || "Error al agregar registro");
  }
});

// elimino registro
export const eliminarRegistro = createAsyncThunk("registros/eliminar", async (data, thunkAPI) => {
  try {
    const { token, idUser, idRegistro } = data;
    await registroService.eliminarRegistro(token, idUser, idRegistro);

    const registrosActualizados = obtenerRegistrosDesdeLocalStorage(idUser).filter(
      (registro) => registro.idRegistro !== idRegistro
    );
    localStorage.setItem(`registros_${idUser}`, JSON.stringify(registrosActualizados));

    return idRegistro;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || "Error al eliminar registro");
  }
});

//slice de registros
const registroSlice = createSlice({
  name: "registros",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    limpiarRegistros: (state, action) => {
      state.registros = [];
      localStorage.removeItem(`registros_${action.payload}`);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(obtenerRegistros.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(obtenerRegistros.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.registros = action.payload;
      })
      .addCase(obtenerRegistros.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(agregarRegistro.fulfilled, (state, action) => {
        state.registros.push(action.payload);
      })
      .addCase(agregarRegistro.rejected, (state, action) => {
        console.warn("Error al agregar registro:", action.payload);
      })
      .addCase(eliminarRegistro.fulfilled, (state, action) => {
        state.registros = state.registros.filter((registro) => registro.idRegistro !== action.payload);
      })
      .addCase(eliminarRegistro.rejected, (state, action) => {
        console.error("Error al eliminar registro:", action.payload);
      });
  },
});

export const { reset, limpiarRegistros } = registroSlice.actions;
export default registroSlice.reducer;