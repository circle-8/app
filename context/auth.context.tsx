import React from "react";

type A = {
	login: (data: any) => void;
};

export const AuthContext = React.createContext<A>({ login: () => {} });
