import React from 'react'
import { NativeBaseProvider, useToast } from 'native-base'
import { NavigationContainer } from '@react-navigation/native'

import { LoginFlow } from './ui/navigation/login.flow'
import { MainTabsFlow } from './ui/navigation/main-tabs.flow'
import { AuthContext } from './context/auth.context'
import { SplashScreen } from './ui/components/splash.component'
import { User } from './services/types'
import { UserService } from './services/user.service'

export default function App() {
	const [loading, setLoading] = React.useState(true)
	const [logged, setLogged] = React.useState(false)
	const authContext = React.useMemo(
		() => ({
			login: async (usr?: User) => {
				setLogged(true)
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
		<NavigationContainer>
			<AuthContext.Provider value={authContext}>
				<NativeBaseProvider>
					{logged ? <MainTabsFlow /> : <LoginFlow />}
				</NativeBaseProvider>
			</AuthContext.Provider>
		</NavigationContainer>
	)
}
