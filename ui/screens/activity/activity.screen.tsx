import React from 'react'
import { Box, Button, Center, VStack } from 'native-base'
import { UserService } from '../../../services/user.service'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ActivityRoutes, ActivityRouteParams, TabRoutes } from '../../../constants/routes'

type Props = NativeStackScreenProps<ActivityRouteParams, 'Activity'>

export const Activity = ({navigation}: Props) => {
	const [isTransportista, setIsTransportista] = React.useState(false)
	
	const getIsTransportista = async () => {
		const user = await UserService.getCurrent()
		if(user.tipoUsuario === "TRANSPORTISTA"){
			setIsTransportista(true);
		}
	}

	const onMisResiduos = async () => {
		navigation.navigate(ActivityRoutes.listResiduos)
	}

	const onMisSolicitudes = async () => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.listSolicitudes, {
			ciudadanoId: user.ciudadanoId
		})
	}

	const onMisRetiros = async () => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.listTransacciones, {
			ciudadanoId: user.ciudadanoId
		})
	}

	const onMisTransportes = async () => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.listMisTransportes, {
			userId: user.id
		})
	}

	const onTransportes = async () => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.listTransportes, {
			userId: user.id
		})
	}

	React.useEffect(() => {
		getIsTransportista()
	}, [])

	return (
		<Center w="100%">
			<Box>Aqui podras consultar toda tu actividad</Box>
			<Button mt="2" color="primary" onPress={onMisResiduos} width="70%">
				Mis residuos
			</Button>
			<Button mt="2" color="primary" onPress={onMisSolicitudes} width="70%">
				Mis solicitudes
			</Button>
			<Button mt="2" color="primary" onPress={onMisRetiros} width="70%">
				Mis Retiros
			</Button>
			{isTransportista && (
				<><Button mt="2" color="primary" onPress={onMisTransportes} width="70%">
					Mis transportes
				</Button>
				<Button mt="2" color="primary" onPress={onTransportes} width="70%">
					Ver transportes disponibles
				</Button></>
			)}
		</Center>
	)
}
