import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Activity } from '../../screens/activity/activity.screen'
import { ActivityRoutes } from '../../../constants/routes'
import { NewResiduo } from '../../screens/activity/new-residuo.screen'
import { ListResiduos } from '../../screens/activity/list-residuos.screen'
import { ListSolicitudes } from '../../screens/activity/list-solicitudes.screen'


const ActivityStack = createNativeStackNavigator()

export const ActivityFlow = () => {
	return (
		<ActivityStack.Navigator>
			<ActivityStack.Screen
				name={ActivityRoutes.activity}
				component={Activity}
				options={{ title: 'Actividad' }}
			/>
			<ActivityStack.Screen
				name={ActivityRoutes.listResiduos}
				component={ListResiduos}
				options={{ title: 'Mis Residuos' }}
			/>
			<ActivityStack.Screen
				name={ActivityRoutes.newResiduo}
				component={NewResiduo}
				options={{ title: 'Nuevo Residuo' }}
			/>
			<ActivityStack.Screen
				name={ActivityRoutes.listSolicitudes}
				component={ListSolicitudes}
				options={{ title: 'Mis Solicitudes' }}
			/>
		</ActivityStack.Navigator>
	)
}
