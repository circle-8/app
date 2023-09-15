import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ActivityRouteParams, ActivityRoutes } from '../../../constants/routes'
import {
	HStack,
	ScrollView,
	View,
	Text,
	WarningOutlineIcon,
	Box,
	Center,
	Button,
	useToast,
} from 'native-base'
import { match } from '../../../utils/either'
import { LoadingScreen } from '../../components/loading.component'
import { TransportistaService } from '../../../services/transportista.service'
import { Transporte } from '../../../services/types'
import { UserService } from '../../../services/user.service'
import * as Location from 'expo-location'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ListMisTransportes'>

export const ListMisTransportes = ({ navigation, route }: Props) => {
	const toast = useToast()
	const { userId } = route.params
	const [isLoading, setLoading] = React.useState(true)
	const [transportes, setTransportes] = React.useState<Transporte[]>([])

	const loadData = async () => {
		setTransportes([])
		const userTransportes = await TransportistaService.getAll({
			userId,
		})
		match(
			userTransportes,
			async t => {
				for (const transporte of t) {
					if (!transporte.transaccion || !transporte.transaccion.puntoReciclaje) {
						const direccion = 'No pudimos obtener la direccion'
						transportes.push({ ...transporte, direccion })
						continue;
					}

					const direccion = await getDirection(
						transporte.transaccion.puntoReciclaje.latitud,
						transporte.transaccion.puntoReciclaje.longitud,
					)

					transportes.push({ ...transporte, direccion })
				}
				setTransportes(transportes)
				setLoading(false)
			},
			e => setTransportes([]),
		)
	}

	const getDirection = async (latitude, longitude) => {
		try {
			const location = await Location.reverseGeocodeAsync({
				latitude,
				longitude,
			})
			const address =
				location.at(0).name +
				', ' +
				location.at(0).city +
				', ' +
				location.at(0).postalCode +
				', ' +
				location.at(0).region
			return address
		} catch (error) {
			return 'No podemos brindar la direccion.'
		}
	}

	const formatFecha = fecha => {
		try {
			if (fecha != null) {
				const dia = fecha.substring(8, 10)
				const mes = fecha.substring(5, 7)
				const anio = fecha.substring(0, 4)
				const mensaje = `${dia}/${mes}/${anio}`
				return mensaje
			}
			return 'No tiene fecha limite'
		} catch (error) {
			console.error('Error al formatear la fecha:', error)
			return 'Ocurrio un error al obtener la fecha'
		}
	}

	const handleComenzar = async id => {
		const error = await TransportistaService.iniciarTransporte(id)
		match(
			error,
			t => {
				toast.show({ description: 'Transporte iniciado correctamente.' })
			},
			err => {
				toast.show({
					description: 'Ocurrio un error al iniciar el transporte, reintenta.',
				})
			},
		)
		loadData()
	}

	const goMapaRecorrido = async (transporte) => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.mapTransportes, {
			transporte: transporte,
		})
	}

	React.useEffect(() => {
		loadData()
	}, [])

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView alignContent="center">
			<Center w="100%">
				<Box mb={5} />
				{transportes && transportes.length > 0 ? (
					transportes.map((transporte, idx) => (
						<View key={`transporte-${idx}`}>
							<Box
								key={`box-${idx}`}
								mb={2}
								p={2}
								borderWidth={1}
								borderColor="gray.300"
								borderRadius="md"
								shadow={1}
								width={350}
								background={'white'}
							>
								<HStack space={2} mt="0.5" alignItems="center">
									<Text fontSize="sm">
										<Text style={{ fontWeight: 'bold' }}>Transporte:</Text> #
										{transporte.id}
									</Text>
								</HStack>
								<HStack space={2} mt="0.5" alignItems="center">
									<Text fontSize="sm" numberOfLines={4}>
										<Text style={{ fontWeight: 'bold' }}>Fecha Acordada:</Text>{' '}
										{formatFecha(transporte.fechaAcordada)}
									</Text>
								</HStack>
								<HStack space={2} mt="0.5" alignItems="center">
									<Text fontSize="sm" numberOfLines={4}>
										<Text style={{ fontWeight: 'bold' }}>Precio acordado:</Text>{' '}
										${transporte.precioAcordado}
									</Text>
								</HStack>
								<HStack space={2} mt="0.5" alignItems="center">
									<Text
										fontSize="sm"
										numberOfLines={4}
										style={{ fontWeight: 'bold' }}
									>
										{transporte.pagoConfirmado
											? 'El pago ha sido realizado'
											: 'El pago aun no ha sido realizado'}
									</Text>
								</HStack>
								<HStack space={2} mt="0.5" alignItems="center">
									<Text fontSize="sm" numberOfLines={4}>
										<Text style={{ fontWeight: 'bold' }}>Estado:</Text>{' '}
										{transporte.entregaConfirmada
											? 'Entregado'
											: 'Pendiente de entrega'}
									</Text>
								</HStack>
								<HStack space={2} mt="0.5" alignItems="center">
									<Text fontSize="sm" numberOfLines={4}>
										<Text style={{ fontWeight: 'bold' }}>Direccion:</Text>{' '}
										{transporte.direccion}
									</Text>
								</HStack>
								{!transporte.entregaConfirmada && (
									<View
										style={{
											flexDirection: 'row',
											justifyContent: 'center',
											alignItems: 'center',
											marginTop: 8,
										}}
									>
										{transporte.fechaInicio != null ? (
											<Button
												onPress={() =>
													goMapaRecorrido(transporte)
												}
											>
												Ver en mapa
											</Button>
										) : (
											<Button onPress={() => handleComenzar(transporte.id)}>
												Comenzar Entrega
											</Button>
										)}
									</View>
								)}
							</Box>
						</View>
					))
				) : (
					<>
						<View
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<WarningOutlineIcon size={5} color="red.600" />
							<Text style={{ fontSize: 14, textAlign: 'center' }}>
								No dispones de transportes asignados a ti.
							</Text>
						</View>
					</>
				)}
			</Center>
		</ScrollView>
	)
}
