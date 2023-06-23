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

export const TabRoutes = {
	home: 'HomeTab',
	activity: 'ActivityTab',
	messages: 'MessagesTab',
	learn: 'LearnTab',
	profile: 'ProfileTab',
}