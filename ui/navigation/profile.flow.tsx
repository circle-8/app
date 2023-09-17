import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Profile } from '../screens/profile/profile.screen'
import { ProfileRoutes } from '../../constants/routes'
import { ListPuntoReciclaje } from '../screens/profile/list-punto-reciclaje.screen'
import { EditPuntoReciclaje } from '../screens/profile/edit-punto-reciclaje.screen'
import { EditPuntoResiduo } from '../screens/profile/edit-punto-residuo.screen'

const ProfileStack = createNativeStackNavigator()

export const ProfileFlow = () => {
	return (
		<ProfileStack.Navigator>
			<ProfileStack.Screen
				name={ProfileRoutes.profile}
				component={Profile}
				options={{ title: 'Perfil' }}
			/>
			<ProfileStack.Screen
				name={ProfileRoutes.listPuntoReciclaje}
				component={ListPuntoReciclaje}
				options={{ title: 'Mis puntos' }}
			/>
			<ProfileStack.Screen
				name={ProfileRoutes.editPuntoReciclaje}
				component={EditPuntoReciclaje}
				options={{ title: 'Punto de Reciclaje Particular' }}
			/>
			<ProfileStack.Screen
				name={ProfileRoutes.editPuntoResiduo}
				component={EditPuntoResiduo}
				options={{ title: 'Punto de Residuo' }}
			/>
		</ProfileStack.Navigator>
	)
}
