import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Login } from '../screens/login/login.screen'
import { SignUp } from '../screens/login/signup.screen'
import { LoginRoutes } from '../../constants/routes'

const LoginStack = createNativeStackNavigator()

export const LoginFlow = () => {
	return (
		<LoginStack.Navigator>
			<LoginStack.Screen name={LoginRoutes.login} component={Login} options={{header: () => <></>}}/>
			<LoginStack.Screen name={LoginRoutes.signup} component={SignUp} options={{title: 'Registrate'}}/>
		</LoginStack.Navigator>
	)
}
