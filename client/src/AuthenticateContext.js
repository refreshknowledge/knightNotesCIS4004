import { createContext } from "react";

export const AuthenticateContext = createContext({user: "", id: 0, status: false});