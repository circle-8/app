import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HomeRoutes } from '../../../constants/routes-reciclador'
import { HomeReciclador } from '../../screens/home-reciclador/home-reciclador.screen'

const HomeStack = createNativeStackNavigator()

export const HomeRecicladorFlow = () => {
	return (
		<HomeStack.Navigator>
			<HomeStack.Screen name={HomeRoutes.home} component={HomeReciclador} options={{header: () => <></>}}/>
		</HomeStack.Navigator>
	)
}
