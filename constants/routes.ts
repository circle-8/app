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
		puntoReciclajeId?: number,
	}
}
type ProfileRouteName = keyof ProfileRoutesParams

export const ProfileRoutes: {
	profile: ProfileRouteName
	listPuntoReciclaje: ProfileRouteName
	editPuntoReciclaje: ProfileRouteName
} = {
	profile: 'Profile',
	listPuntoReciclaje: 'ListPuntoReciclaje',
	editPuntoReciclaje: 'EditPuntoReciclaje',
}

export type HomeRoutesParams = {
	Home: undefined
}
type HomeRouteName = keyof HomeRoutesParams

export const HomeRoutes: {
	home: HomeRouteName
} = {
	home: 'Home'
}

type TabRoutesParams = {
	HomeTab: undefined,
	ActivityTab: undefined,
	MessagesTab: undefined,
	LearnTab: undefined,
	ProfileTab: {
		screen: ProfileRouteName,
		initial: boolean
	}
}

export const TabRoutes = {
	home: 'HomeTab',
	activity: 'ActivityTab',
	messages: 'MessagesTab',
	learn: 'LearnTab',
	profile: 'ProfileTab',
}

export type MainRoutesParams = HomeRoutesParams & ProfileRoutesParams & TabRoutesParams
