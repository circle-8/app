import React from 'react'
import { NativeBaseProvider, extendTheme, useToast } from 'native-base'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'

import { LoginFlow } from './ui/navigation/login.flow'
import { MainTabsFlow } from './ui/navigation/main-tabs.flow'
import { AuthContext } from './context/auth.context'
import { SplashScreen } from './ui/components/splash.component'
import { User } from './services/types'
import { UserService } from './services/user.service'

const navigationTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#394637',
		text: '#394637',
		card: '#E0F5DD',
		border: 'lightgray',
	}
}

const baseTheme = extendTheme({
	colors: {
		primary: {
			50: '#E0F5DD',
			100: '#D9F3D5',
			200: '#C3DABF',
			300: '#ADC2AA',
			400: '#97AA95',
			500: '#82917f',
			600: '#6C796A',
			700: '#566155',
			800: '#41483F',
			900: '#2B302A',
		}
	}
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
