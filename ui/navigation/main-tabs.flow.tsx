import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from '@expo/vector-icons/Ionicons'

import { HomeFlow } from './home.flow'
import { TabRoutes } from '../../constants/routes'
import { ProfileFlow } from './profile.flow'

interface Icons {
	[key: string]: {
		outline: keyof typeof Ionicons.glyphMap
		focused: keyof typeof Ionicons.glyphMap
	}
}

const icons: Icons = {
	[TabRoutes.home]: {
		outline: 'home-outline',
		focused: 'home',
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
			<Tab.Screen name={TabRoutes.home} component={HomeFlow} options={{title: 'Inicio'}}/>
			<Tab.Screen name={TabRoutes.profile} component={ProfileFlow} options={{title: 'Perfil'}}/>
		</Tab.Navigator>
	)
}
