import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Home } from '../screens/home/home.screen'

const HomeStack = createNativeStackNavigator()

export const HomeFlow = () => {
	return (
		<HomeStack.Navigator>
			<HomeStack.Screen name="Home" component={Home} options={{header: () => <></>}}/>
		</HomeStack.Navigator>
	)
}
