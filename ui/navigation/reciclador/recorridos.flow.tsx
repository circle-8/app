import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabRoutes } from '../../../constants/routes-reciclador'
import { Recorridos } from '../../screens/recorridos/recorridos.screen'

const RecorridosStack = createNativeStackNavigator()

export const RecorridosFlow = () => {
	return (
		<RecorridosStack.Navigator>
			<RecorridosStack.Screen name={TabRoutes.messages} component={Recorridos} options={{title: 'Recorridos'}}/>
		</RecorridosStack.Navigator>
	)
}
