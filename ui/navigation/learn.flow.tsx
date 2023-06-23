import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Learn } from '../screens/learn/learn.screen'

const LearnStack = createNativeStackNavigator()

export const LearnFlow = () => {
	return (
		<LearnStack.Navigator>
			<LearnStack.Screen name="Learn" component={Learn} />
		</LearnStack.Navigator>
	)
}
