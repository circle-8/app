import React from 'react'

type AuthFunctions = {
	login: (data: any) => void
	logout: () => void
}

export const AuthContext = React.createContext<AuthFunctions>({
	login: () => {},
	logout: () => {},
})
