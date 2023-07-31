import { PuntoResiduo } from '../services/types'

export type LoginRoutesParams = {
	Login: undefined
	SignUp: undefined
}
type LoginRouteName = keyof LoginRoutesParams

export const LoginRoutes: {
	login: LoginRouteName
	signup: LoginRouteName
} = {
	login: 'Login',
	signup: 'SignUp',
}

export type ProfileRoutesParams = {
	Profile: undefined
	ListPuntoReciclaje: undefined
	EditPuntoReciclaje: {
		puntoReciclajeId?: number
		recicladorId: number
	}
	EditPuntoResiduo: {
		ciudadanoId: number
		punto?: PuntoResiduo
	}
}
type ProfileRouteName = keyof ProfileRoutesParams

export const ProfileRoutes: {
	profile: 'Profile'
	listPuntoReciclaje: 'ListPuntoReciclaje'
	editPuntoReciclaje: 'EditPuntoReciclaje'
	editPuntoResiduo: 'EditPuntoResiduo'
} = {
	profile: 'Profile',
	listPuntoReciclaje: 'ListPuntoReciclaje',
	editPuntoReciclaje: 'EditPuntoReciclaje',
	editPuntoResiduo: 'EditPuntoResiduo',
}

export type HomeRoutesParams = {
	Home: undefined
}
type HomeRouteName = keyof HomeRoutesParams

export const HomeRoutes: {
	home: HomeRouteName
} = {
	home: 'Home',
}

export type AcitivityRouteParams = {
	Activity: undefined
	NewResiduo: {
		ciudadanoId: number
		puntoResiduoId: number
	},
	ListResiduos: undefined
}
type ActivityRouteName = keyof AcitivityRouteParams

export const ActivityRoutes: {
	activity: 'Activity'
	newResiduo: 'NewResiduo',
	listResiduos: 'ListResiduos',
} = {
	activity: 'Activity',
	newResiduo: 'NewResiduo',
	listResiduos: 'ListResiduos',
}

type TabRoutesParams = {
	HomeTab: undefined
	ActivityTab: {
		screen: ActivityRouteName
		initial: boolean
		params: {
			ciudadanoId?: number
			puntoResiduoId?: number
		}
	}
	MessagesTab: undefined
	LearnTab: undefined
	ProfileTab: {
		screen: ProfileRouteName
		initial: boolean
		params?: {
			ciudadanoId: number
			punto?: PuntoResiduo
		}
	}
}

export const TabRoutes: {
	home: 'HomeTab'
	activity: 'ActivityTab'
	messages: 'MessagesTab'
	learn: 'LearnTab'
	profile: 'ProfileTab'
} = {
	home: 'HomeTab',
	activity: 'ActivityTab',
	messages: 'MessagesTab',
	learn: 'LearnTab',
	profile: 'ProfileTab',
}

export type MainRoutesParams = HomeRoutesParams &
	ProfileRoutesParams &
	AcitivityRouteParams &
	TabRoutesParams
