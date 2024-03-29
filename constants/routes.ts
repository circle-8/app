import { PuntoResiduo, Transporte, User } from '../services/types'

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
	EditPerfil: {
		userId: number
	}
}
type ProfileRouteName = keyof ProfileRoutesParams

export const ProfileRoutes: {
	profile: 'Profile'
	listPuntoReciclaje: 'ListPuntoReciclaje'
	editPuntoReciclaje: 'EditPuntoReciclaje'
	editPuntoResiduo: 'EditPuntoResiduo'
	editPerfil: 'EditPerfil'
} = {
	profile: 'Profile',
	listPuntoReciclaje: 'ListPuntoReciclaje',
	editPuntoReciclaje: 'EditPuntoReciclaje',
	editPuntoResiduo: 'EditPuntoResiduo',
	editPerfil: 'EditPerfil',
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

export type ActivityRouteParams = {
	Activity: undefined
	NewResiduo: {
		ciudadanoId: number
		puntoResiduoId: number
		residuoId: number
	},
	ListResiduos: undefined
	ListSolicitudes: {
		ciudadanoId: number
	},
	ListTransacciones: {
		ciudadanoId: number
	},
	ViewTransaccion: {
		ciudadanoId: number
		transaccionId: number
	},
	ListMisTransportes: {
		userId: number
	},
	ListTransportes: {
		userId: number
	},
	MapTransportes: {
		transporte: Transporte
	},
	ListZonas: {
		ciudadanoId: number
	}
}
type ActivityRouteName = keyof ActivityRouteParams

export const ActivityRoutes: {
	activity: 'Activity'
	newResiduo: 'NewResiduo'
	listSolicitudes: 'ListSolicitudes'
	listTransacciones: 'ListTransacciones'
	viewTransaccion: 'ViewTransaccion'
	listResiduos: 'ListResiduos'
	listMisTransportes: 'ListMisTransportes'
	listTransportes: 'ListTransportes'
	mapTransportes: 'MapTransportes'
	listZonas: 'ListZonas'
} = {
	activity: 'Activity',
	newResiduo: 'NewResiduo',
	listSolicitudes: 'ListSolicitudes',
	listTransacciones: 'ListTransacciones',
	viewTransaccion: 'ViewTransaccion',
	listResiduos: 'ListResiduos',
	listMisTransportes: 'ListMisTransportes',
	listTransportes: 'ListTransportes',
	mapTransportes: 'MapTransportes',
	listZonas: 'ListZonas'
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
	ActivityRouteParams &
	TabRoutesParams
