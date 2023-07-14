import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from '@expo/vector-icons/Ionicons'

import { HomeFlow } from './home.flow'
import { TabRoutes } from '../../constants/routes'
import { ProfileFlow } from './profile.flow'
import { ActivityFlow } from './activity.flow'
import { MessagesFlow } from './messages.flow'
import { LearnFlow } from './learn.flow'

interface Icons {
	[key: string]: {
		outline: keyof typeof Ionicons.glyphMap
		focused: keyof typeof Ionicons.glyphMap
	}
}

const icons: Icons = {
	[TabRoutes.home]: {
		outline: 'map-outline',
		focused: 'map',
	},
	[TabRoutes.activity]: {
		outline: 'newspaper-outline',
		focused: 'newspaper',
	},
	[TabRoutes.messages]: {
		outline: 'chatbox-ellipses-outline',
		focused: 'chatbox-ellipses',
	},
	[TabRoutes.learn]: {
		outline: 'book-outline',
		focused: 'book',
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
			<Tab.Screen name={TabRoutes.activity} component={ActivityFlow} options={{title: 'Actividad'}}/>
			<Tab.Screen name={TabRoutes.messages} component={MessagesFlow} options={{title: 'Mensajes'}}/>
			<Tab.Screen name={TabRoutes.learn} component={LearnFlow} options={{title: 'Aprende'}}/>
			<Tab.Screen name={TabRoutes.profile} component={ProfileFlow} options={{title: 'Perfil'}}/>
		</Tab.Navigator>
	)
}
