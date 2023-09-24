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
	Modal,
	Input,
	InfoOutlineIcon,
	CheckCircleIcon,
	Tooltip,
} from 'native-base'
import { match } from '../../../utils/either'
import { LoadingScreen } from '../../components/loading.component'
import { TransportistaService } from '../../../services/transportista.service'
import { Transporte } from '../../../services/types'
import { UserService } from '../../../services/user.service'
import * as Location from 'expo-location'
import { TouchableOpacity } from 'react-native'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ListMisTransportes'>

export const ListMisTransportes = ({ navigation, route }: Props) => {
	const toast = useToast()
	const { userId } = route.params
	const [isLoading, setLoading] = React.useState(true)
	const [transportes, setTransportes] = React.useState<Transporte[]>([])
	const [transportePrecio, setTransportePrecio] = React.useState<Transporte>()
	const [modalPrecio, setModalPrecio] = React.useState(false)
	const [importe, setImporte] = React.useState('');
	const [mostrarTooltip, setMostrarTooltip] = React.useState(false)
	const [idxTooltip, setIdxTooltip] = React.useState<Number>()

	const loadData = async () => {
		setLoading(true)
		setTransportes([]);
		const userTransportes = await TransportistaService.getAll({
			userId,
			entregaConfirmada: null,
		})
		const transportesActualizados: Transporte[] = [];
		match(
			userTransportes,
			async t => {
				for (const transporte of t) {
					if (!transporte.transaccion || !transporte.transaccion.puntoReciclaje) {
						const direccion = 'No pudimos obtener la direccion'
						transportesActualizados.push({ ...transporte, direccion })
						continue;
					}

					const direccion = await getDirection(
						transporte.transaccion.puntoReciclaje.latitud,
						transporte.transaccion.puntoReciclaje.longitud,
					)

					transportesActualizados.push({ ...transporte, direccion })
				}
				setTransportes(transportesActualizados)
				setLoading(false)
			},
			e => { setTransportes([])
					setLoading(false)
			},
		)
	}

	const getDirection = async (latitude, longitude) => {
		try {
			const location = await Location.reverseGeocodeAsync({
				latitude,
				longitude,
			})

			let address = ''
			if (location != null && location.at(0) != null) {
				address += location.at(0).name ? location.at(0).name : ''
				address += location.at(0).city ? ', ' + location.at(0).city : ''
				address += location.at(0).postalCode ? ', ' + location.at(0).postalCode : ''
				address += location.at(0).region ? ', ' + location.at(0).region : ''
			} else {
				address = 'No podemos brindar la direccion.'
			}

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

	const handleComenzar = async (transporte) => {
		const error = await TransportistaService.iniciarTransporte(transporte.id)
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

	const setPagoConfirmado = async (transporte) => {
		const error = await TransportistaService.pagoConfirmado(transporte.id)
		match(
			error,
			t => {
				toast.show({ description: 'Pago confirmado correctamente.' })
			},
			err => {
				toast.show({
					description: 'Ocurrio un error al confirmar el pago, reintenta.',
				})
			},
		)
		loadData()
	}

	const handleModificarImporte = async (id, importe) => {
		const error = await TransportistaService.modificarImporte(id, importe)
		match(
			error,
			t => {
				toast.show({ description: 'Modificado correctamente.' })
			},
			err => {
				toast.show({
					description: 'Ocurrio un error al modificar el precio, reintenta.',
				})
			},
		)
		setModalPrecio(false)
		setImporte(null)
		loadData()
	}

	const goMapaRecorrido = async (transporte) => {
		const user = await UserService.getCurrent()
		navigation.navigate(ActivityRoutes.mapTransportes, {
			transporte: transporte,
		})
	}

	const handleTooltip = (idx) => {
		if (mostrarTooltip == false || idx == idxTooltip){
			setMostrarTooltip(!mostrarTooltip)
		}
		setIdxTooltip(idx)
	  };	

	React.useEffect(() => {
		const unsubscribeFocus = navigation.addListener('focus', () => {
			setLoading(true)
			setTransportes([]);
			loadData()
		})

		return unsubscribeFocus
	}, [navigation])

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
										<Text style={{ fontWeight: 'bold' }}>Precio sugerido:</Text>{' '}
										${transporte.precioSugerido}
									</Text>
									<TouchableOpacity
										onPress={() => handleTooltip(idx)}
									>
										<InfoOutlineIcon size={5} color="green.800" />
									</TouchableOpacity>
								</HStack>
								<HStack space={2} mt="0.5" alignItems="center" justifyContent="center">
									{mostrarTooltip && idx == idxTooltip && (
										<View
											style={{
												backgroundColor: '#C3DABF',
												padding: 5,
												borderRadius: 5,
											}}
										>
											<Text fontSize="xs" color='green.800' >Calculado en base a cantidad de residuos y kms a recorrer.</Text>
										</View>
									)}
								</HStack>
								<HStack space={2} mt="0.5" alignItems="center">
									<Text fontSize="sm" numberOfLines={4}>
										<Text style={{ fontWeight: 'bold' }}>Precio acordado:</Text>{' '}
										{transporte.precioAcordado
											? '$' + transporte.precioAcordado
											: 'Modifica el importe a recibir.'}
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
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'center',
										alignItems: 'center',
										marginTop: 8,
									}}
								>
									{transporte.fechaInicio != null &&
									transporte.fechaFin == null ? (
										<Button onPress={() => goMapaRecorrido(transporte)}>
											Ver en mapa
										</Button>
									) : transporte.fechaInicio != null &&
									  transporte.fechaFin != null &&
									  !transporte.pagoConfirmado ? (
										<Button onPress={() => setPagoConfirmado(transporte)}>
											Confirmar pago
										</Button>
									) : transporte.fechaInicio != null &&
									  transporte.fechaFin != null &&
									  !transporte.entregaConfirmada ? (
										<>
											<View
												style={{
													flex: 1,
													justifyContent: 'center',
													alignItems: 'center',
												}}
											>
												<InfoOutlineIcon size={5} color="green.600" />
												<Text style={{ fontSize: 14, textAlign: 'center' }}>
													Esperando que confirmen la entrega.
												</Text>
											</View>
										</>
									) : transporte.fechaInicio != null &&
									  transporte.fechaFin != null &&
									  transporte.entregaConfirmada &&
									  transporte.pagoConfirmado ? (
										<>
											<View
												style={{
													flex: 1,
													justifyContent: 'center',
													alignItems: 'center',
												}}
											>
												<CheckCircleIcon size={5} color="green.600" />
												<Text style={{ fontSize: 14, textAlign: 'center' }}>
													Este transporte finalizo con exito.
												</Text>
											</View>
										</>
									) : (
										<>
											<Button
												onPress={() => {
													setModalPrecio(true)
													setTransportePrecio(transporte)
												}}
											>
												Modificar importe
											</Button>
											<View style={{ marginHorizontal: 10 }} />
											<Button onPress={() => handleComenzar(transporte)}>
												Comenzar Entrega
											</Button>
										</>
									)}
								</View>
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
			<Modal
				isOpen={modalPrecio}
				onClose={() => setModalPrecio(false)}
				size="lg"
			>
				<Modal.Content>
					<Modal.CloseButton />
					<Modal.Header alignItems="center">
						<Text bold fontSize="xl">
							Ingresa el importe que consideres apropiado.
						</Text>
					</Modal.Header>
					<Modal.Body>
						<Input
							keyboardType="numeric"
							value={importe}
							onChangeText={value => setImporte(value)}
							placeholder="Ingrese el importe"
						/>
					</Modal.Body>
					<Modal.Footer>
						<Center flex={1}>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
								}}
							>
								<Button onPress={() => setModalPrecio(false)}>Cerrar</Button>
								<View style={{ marginHorizontal: 10 }} />
								<Button
									onPress={() =>
										handleModificarImporte(transportePrecio.id, importe)
									}
								>
									Modificar importe
								</Button>
							</View>
						</Center>
					</Modal.Footer>
				</Modal.Content>
			</Modal>
		</ScrollView>
	)
}
function wait(arg0: number) {
	throw new Error('Function not implemented.')
}

