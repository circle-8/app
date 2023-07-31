import React from 'react'
import { Button, Center } from 'native-base'
import { AcitivityRouteParams, ActivityRoutes } from '../../../constants/routes'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

type Props = NativeStackScreenProps<AcitivityRouteParams, 'Activity'>

export const Activity = ({ navigation }: Props) => {
	return (
		<Center w="100%" flex="1">
			<Button
				m="5"
				size="lg"
				width="60%"
				color="primary"
				onPress={() => navigation.navigate(ActivityRoutes.listResiduos)}
			>
				Mis Residuos
			</Button>
			<Button m="5" size="lg" width="60%" color="primary">
				Mis Solicitudes
			</Button>
			<Button m="5" size="lg" width="60%" color="primary">
				Mis Depositos
			</Button>
		</Center>
	)
}
