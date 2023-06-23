import React from 'react'
import { NativeBaseProvider, extendTheme, useToast } from 'native-base'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'

import { LoginFlow } from './ui/navigation/login.flow'
import { MainTabsFlow } from './ui/navigation/main-tabs.flow'
import { AuthContext } from './context/auth.context'
import { SplashScreen } from './ui/components/splash.component'
import { User } from './services/types'
import { UserService } from './services/user.service'

import { colors } from './constants/styles'

const navigationTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: colors.primaryText,
		text: colors.primaryText,
		card: colors.primary50,
		border: 'lightgray',
	},
}

const baseTheme = extendTheme({
	colors: {
		primary: {
			50: colors.primary50,
			100: colors.primary100,
			200: colors.primary200,
			300: colors.primary300,
			400: colors.primary400,
			500: colors.primary500,
			600: colors.primary600,
			700: colors.primary700,
			800: colors.primary800,
			900: colors.primary900,
		},
	},
})

export default function App() {
	const [loading, setLoading] = React.useState(true)
	const [logged, setLogged] = React.useState(false)
	const authContext = React.useMemo(
		() => ({
			login: async (usr?: User) => {
				setLogged(true)
			},
			logout: () => {
				setLogged(false)
			},
		}),
		[]
	)
	const toast = useToast()

	React.useEffect(() => {
		;(async () => {
			if (await UserService.isLogged()) {
				const error = await UserService.refreshToken()
				if (error !== null) {
					toast.show({
						description: 'Hubo un error al iniciar sesión automáticamente',
					})
				} else {
					await authContext.login()
				}
			}

			setLoading(false)
		})()
	}, [])

	if (loading) {
		return (
			<NativeBaseProvider>
				<SplashScreen />
			</NativeBaseProvider>
		)
	}

	return (
		<NavigationContainer theme={navigationTheme}>
			<AuthContext.Provider value={authContext}>
				<NativeBaseProvider theme={baseTheme}>
					{logged ? <MainTabsFlow /> : <LoginFlow />}
				</NativeBaseProvider>
			</AuthContext.Provider>
		</NavigationContainer>
	)
}
