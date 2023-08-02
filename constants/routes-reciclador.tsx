import { ProfileRoutesParams } from './routes'

export type HomeRoutesParams = {
	Home: undefined
}
export const HomeRoutes: {
	home: 'Home'
} = {
	home: 'Home',
}

export type RecorridoRoutesParams = {
	Recorridos: undefined
}
export const RecorridosRoutes: {
	recorridos: 'Recorridos'
} = {
	recorridos: 'Recorridos',
}

export const TabRoutes: {
	home: 'HomeTab'
	recorrido: 'RecorridoTab'
	messages: 'MessagesTab'
	profile: 'ProfileTab'
} = {
	home: 'HomeTab',
	recorrido: 'RecorridoTab',
	messages: 'MessagesTab',
	profile: 'ProfileTab',
}

export type MainRoutesParams = HomeRoutesParams & RecorridoRoutesParams & ProfileRoutesParams
