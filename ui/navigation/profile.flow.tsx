import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Profile } from '../screens/profile/profile.screen'

const ProfileStack = createNativeStackNavigator()

export const ProfileFlow = () => {
	return (
		<ProfileStack.Navigator>
			<ProfileStack.Screen name="Profile" component={Profile} />
		</ProfileStack.Navigator>
	)
}
