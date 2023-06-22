import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from '@expo/vector-icons/Ionicons'

import { HelloWorldFlow } from './hw.flow'
import { TabRoutes } from '../../constants/routes'
import { ProfileFlow } from './profile.flow'

interface Icons {
	[key: string]: {
		outline: keyof typeof Ionicons.glyphMap
		focused: keyof typeof Ionicons.glyphMap
	}
}

const icons: Icons = {
	[TabRoutes.helloWorld]: {
		outline: 'ios-infinite-outline',
		focused: 'ios-infinite',
	},
	[TabRoutes.profile]: {
		outline: 'person-outline',
		focused: 'person',
	},
}

const Tab = createBottomTabNavigator()

export const MainTabsFlow = () => {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					const tabName = route.name
					const iconName = focused
						? icons[tabName].focused
						: icons[tabName].outline
					return <Ionicons name={iconName} size={size} color={color} />
				},
				headerShown: false,
			})}
		>
			<Tab.Screen name={TabRoutes.helloWorld} component={HelloWorldFlow} />
			<Tab.Screen name={TabRoutes.profile} component={ProfileFlow} />
		</Tab.Navigator>
	)
}
