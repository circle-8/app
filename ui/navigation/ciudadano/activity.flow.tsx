import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Activity } from '../../screens/activity/activity.screen'
import { ActivityRoutes } from '../../../constants/routes'
import { NewResiduo } from '../../screens/activity/new-residuo.screen'
import { ListResiduos } from '../../screens/activity/list-residuos.screen'
import { ListSolicitudes } from '../../screens/activity/list-solicitudes.screen'
import { ListTransacciones } from '../../screens/activity/list-transacciones.screen'
import { ViewTransaccion } from '../../screens/activity/view-transaccion.screen'
import { ListMisTransportes } from '../../screens/activity/list-misTransportes.screen'
import { ListTransportes } from '../../screens/activity/list-transportes.screen'
import { MapTransportes } from '../../screens/activity/map-transportes.screen'
import { ListZonas } from '../../screens/activity/list-zonas.screen'


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
			<ActivityStack.Screen
				name={ActivityRoutes.listTransacciones}
				component={ListTransacciones}
				options={{ title: 'Mis Retiros' }}
			/>
			<ActivityStack.Screen
				name={ActivityRoutes.viewTransaccion}
				component={ViewTransaccion}
				options={{ title: 'Transaccion' }}
			/>
			<ActivityStack.Screen
				name={ActivityRoutes.listMisTransportes}
				component={ListMisTransportes}
				options={{ title: 'Mis Transportes' }}
			/>
			<ActivityStack.Screen
				name={ActivityRoutes.listTransportes}
				component={ListTransportes}
				options={{ title: 'Transportes Disponibles' }}
			/>
			<ActivityStack.Screen
				name={ActivityRoutes.listZonas}
				component={ListZonas}
				options={{ title: 'Mis Circuitos de reciclaje' }}
			/>
			<ActivityStack.Screen
				name={ActivityRoutes.mapTransportes}
				component={MapTransportes}
				options={{ title: '' }}
			/>
		</ActivityStack.Navigator>
	)
}
