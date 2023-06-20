import React from "react";

type AuthFunctions = {
	login: (data: any) => void;
};

export const AuthContext = React.createContext<AuthFunctions>({ login: () => {} });
