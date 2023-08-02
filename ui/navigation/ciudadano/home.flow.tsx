import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Home } from '../../screens/home/home.screen'
import { HomeRoutes } from '../../../constants/routes'

const HomeStack = createNativeStackNavigator()

export const HomeFlow = () => {
	return (
		<HomeStack.Navigator>
			<HomeStack.Screen name={HomeRoutes.home} component={Home} options={{header: () => <></>}}/>
		</HomeStack.Navigator>
	)
}
