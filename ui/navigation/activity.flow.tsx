import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Activity } from '../screens/activity/activity.screen'

const ActivityStack = createNativeStackNavigator()

export const ActivityFlow = () => {
	return (
		<ActivityStack.Navigator>
			<ActivityStack.Screen
				name="Activity"
				component={Activity}
				options={{ title: 'Actividad' }}
			/>
		</ActivityStack.Navigator>
	)
}
