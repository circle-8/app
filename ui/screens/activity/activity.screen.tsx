import React from 'react'
import { Box, Button, Center, VStack, View, Text, ScrollView } from 'native-base'
import { UserService } from '../../../services/user.service'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
	ActivityRoutes,
	ActivityRouteParams,
	TabRoutes,
} from '../../../constants/routes'

type Props = NativeStackScreenProps<ActivityRouteParams, 'Activity'>

export const Activity = ({ navigation }: Props) => {
	const [isTransportista, setIsTransportista] = React.useState(false)

	const getIsTransportista = async () => {
		const user = await UserService.getCurrent()
		if (user.tipoUsuario === 'TRANSPORTISTA') {
			setIsTransportista(true)
		}
	}

	const onMisResiduos = async () => {
		navigation.navigate(ActivityRoutes.listResiduos)
	}

	const onMisZonas = async () => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.listZonas, {
			ciudadanoId: user.ciudadanoId,
		})
	}

	const onMisSolicitudes = async () => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.listSolicitudes, {
			ciudadanoId: user.ciudadanoId,
		})
	}

	const onMisRetiros = async () => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.listTransacciones, {
			ciudadanoId: user.ciudadanoId,
		})
	}

	const onMisTransportes = async () => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.listMisTransportes, {
			userId: user.id,
		})
	}

	const onTransportes = async () => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.listTransportes, {
			userId: user.id,
		})
	}

	React.useEffect(() => {
		getIsTransportista()
	}, [])

	return (
		<>
		<ScrollView>
			<Center w="100%">
				<Box marginTop={5} >Aquí podrás consultar toda tu actividad</Box>
			</Center>
			{isTransportista && (
				<>
					<View style={{ marginTop: 6, paddingLeft: 20 }}>
						<Text fontSize="sm" fontWeight="bold" textAlign="left">
							"Mis transportes"
						</Text>
					</View>
					<View style={{ marginTop: 2, marginLeft: 30, paddingRight:30 }}>
						<Text fontSize="xs" style={{ textAlign: 'left' }}>
							{'\u2022'} Podras ver todas los transportes aceptados por ti, acordar el valor, iniciar la entrega, seguir el mapa y finalizarlos.
						</Text>
					</View>
					<View style={{ marginTop: 6, paddingLeft: 20 }}>
						<Text fontSize="sm" fontWeight="bold" textAlign="left">
							"Ver transportes disponibles"
						</Text>
					</View>
					<View style={{ marginTop: 2, marginLeft: 30, paddingRight:30 }}>
						<Text fontSize="xs" style={{ textAlign: 'left' }}>
							{'\u2022'} Podras ver todas aquellas transacciones que requieran de un transportista y solicitar la que te interese.
						</Text>
					</View>
				</>
			)}
			<View style={{ marginTop: 10, paddingLeft: 20 }}>
				<Text fontSize="sm" fontWeight="bold" textAlign="left">
					"Mis residuos"
				</Text>
			</View>
			<View style={{ marginTop: 2, paddingLeft: 30, paddingRight:30 }}>
				<Text fontSize="xs" style={{ textAlign: 'left' }}>
					{'\u2022'} Podras marcarlos como retirados, editarlos o agregarlos a un recorrido.
				</Text>
			</View>
			<View style={{ marginTop: 10, paddingLeft: 20 }}>
				<Text fontSize="sm" fontWeight="bold" textAlign="left">
					"Mis Circuitos de reciclaje"
				</Text>
			</View>
			<View style={{ marginTop: 2, paddingLeft: 30, paddingRight:30 }}>
				<Text fontSize="xs" style={{ textAlign: 'left' }}>
					{'\u2022'} Podras ver los circuitos de reciclaje a las que perteneces y pueden retirar tus residuos.
				</Text>
			</View>
			<View style={{ marginTop: 6, paddingLeft: 20 }}>
				<Text fontSize="sm" fontWeight="bold" textAlign="left">
					"Mis solicitudes"
				</Text>
			</View>
			<View style={{ marginTop: 2, paddingLeft: 30, paddingRight:30 }}>
				<Text fontSize="xs" style={{ textAlign: 'left' }}>
					{'\u2022'} Podras consultar el historial de solicitudes de retiro o entrega de residuos.
				</Text>
			</View>
			<View style={{ marginTop: 6, paddingLeft: 20 }}>
				<Text fontSize="sm" fontWeight="bold" textAlign="left">
					"Mis retiros"
				</Text>
			</View>
			<View style={{ marginTop: 2, marginLeft: 30, paddingRight:30 }}>
				<Text fontSize="xs" style={{ textAlign: 'left' }}>
					{'\u2022'} Podras ver todas aquellas transacciones que hayan sido finalizadas y cuales fueron los residuos asociados.
				</Text>
			</View>
			<Center w="100%"  marginTop={5} marginBottom={10}>
			{isTransportista && (
					<>
						<Button
							mt="2"
							color="primary"
							onPress={onMisTransportes}
							width="70%"
						>
							Mis transportes
						</Button>
						<Button mt="2" color="primary" onPress={onTransportes} width="70%">
							Ver transportes disponibles
						</Button>
					</>
				)}
				<Button mt="2" color="primary" onPress={onMisResiduos} width="70%">
					Mis residuos
				</Button>
				<Button mt="2" color="primary" onPress={onMisZonas} width="70%">
					Mis circuitos de reciclaje
				</Button>
				<Button mt="2" color="primary" onPress={onMisSolicitudes} width="70%">
					Mis solicitudes
				</Button>
				<Button mt="2" color="primary" onPress={onMisRetiros} width="70%">
					Mis retiros
				</Button>
			</Center>
			</ScrollView>
		</>
	)
}
