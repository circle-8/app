import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from '@expo/vector-icons/Ionicons'
import { TabRoutes } from '../../../constants/routes-reciclador'
import { ProfileFlow } from '../profile.flow'
import { HomeRecicladorFlow } from './home-reciclador.flow'
import { RecorridosFlow } from './recorridos.flow'
import { MessagesFlow } from '../messages.flow'

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
	[TabRoutes.recorrido]: {
		outline: 'navigate-outline',
		focused: 'navigate',
	},
	[TabRoutes.messages]: {
		outline: 'chatbox-ellipses-outline',
		focused: 'chatbox-ellipses',
	},
	[TabRoutes.profile]: {
		outline: 'person-outline',
		focused: 'person',
	},
}

const Tab = createBottomTabNavigator()

export const MainRecicladorTabsFlow = () => {
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
			<Tab.Screen name={TabRoutes.home} component={HomeRecicladorFlow} options={{title: 'Inicio'}}/>
			<Tab.Screen name={TabRoutes.recorrido} component={RecorridosFlow} options={{title: 'Recorridos'}}/>
			<Tab.Screen name={TabRoutes.messages} component={MessagesFlow} options={{title: 'Mensajes'}}/>
			<Tab.Screen name={TabRoutes.profile} component={ProfileFlow} options={{title: 'Perfil'}}/>
		</Tab.Navigator>
	)
}
