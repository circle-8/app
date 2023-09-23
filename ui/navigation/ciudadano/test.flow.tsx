import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Test } from '../../screens/test/test.screen'

const ProfileStack = createNativeStackNavigator()

export const TestFlow = () => {
	return (
		<ProfileStack.Navigator>
			<ProfileStack.Screen
				name='test'
				component={Test}
				options={{ title: 'Test' }}
			/>
		</ProfileStack.Navigator>
	)
}
