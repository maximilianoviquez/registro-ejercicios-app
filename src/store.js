import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import registroReducer from "./features/registros/registroSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        registros: registroReducer,
    },
    devTools: process.env.NODE_ENV !== "production", //habilito redux devtools solo en desarrolloo , cuando haga el product no se van a poder usar 
});

export default store;
