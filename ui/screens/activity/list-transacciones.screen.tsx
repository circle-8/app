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
	InfoOutlineIcon,
	CheckCircleIcon,
} from 'native-base'
import { match } from '../../../utils/either'
import { TransaccionService } from '../../../services/transaccion.service'
import { LoadingScreen } from '../../components/loading.component'
import { Transaccion } from '../../../services/types'
import { formatFecha } from '../../../utils/days'
import { TouchableOpacity } from 'react-native'
import { TransportistaService } from '../../../services/transportista.service'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ListTransacciones'>

export const ListTransacciones = ({ navigation, route }: Props) => {
	const toast = useToast()
	const { ciudadanoId } = route.params
	const [isLoading, setLoading] = React.useState(true)
	const [transactions, setTransactions] = React.useState<Transaccion[]>([])

	const loadData = async () => {
		const userTransactions = await TransaccionService.getAll({
			ciudadanoId,
		})
		match(
			userTransactions,
			t => setTransactions(t),
			e => setTransactions([]),
		)
		setLoading(false)
	}
	const handleEntregada = async transaccion => {
		const res = await TransaccionService.fulfill(transaccion.id)

		match(
			res,
			async t => {
				const resp = await TransportistaService.entregaConfirmada(transaccion.transporte.id)
				match(
					resp,
					p => {
						toast.show({
							description: '¡Entrega confirmada exitosamente!',
						})
						navigation.goBack()
					},
					err => {
						toast.show({ description: err })
						navigation.goBack()
					},
				)
			},
			err => {
				toast.show({
					description: 'Ocurrió un error al confirmar la entrega, reintenta.',
				})
			},
		)

		loadData()
	}
	
	const handleCancelarTransportista = async (id) => {
		const error = await TransaccionService.deleteSolicTransporte(id)
		match(
			error,
			t => {
				toast.show({ description: 'Transporte cancelado correctamente.' })
			},
			err => {
				toast.show({
					description: 'Ocurrio un error al cancelar el transporte, reintenta.',
				})
			},
		)
		loadData()
	}

	const handleSolicitarTransportista = async (id) => {
		const error = await TransaccionService.solicTransporte(id)
		match(
			error,
			t => {
				toast.show({ description: 'Transporte solicitado correctamente.' });
			},
			err => {
				toast.show({
					description: 'Ocurrio un error al solicitar el Transporte, reintenta.',
				})
			},
		)
		loadData()
	}

	React.useEffect(() => {
		const unsubscribeFocus = navigation.addListener('focus', () => {
			setLoading(true)
			loadData()
		})

		return unsubscribeFocus
	}, [navigation])

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 5 }}>
			<Text fontSize="xs" fontWeight="bold" textAlign="center" mb={2} mt={4} width={"80%"}>
				Aqui encontras tus transacciones, podras solicitar un transportista, confirmar la entrega del residuo y
				completar la transaccion una vez que poseas los residuos en tu poder.
			</Text>
			<Center w="100%">
				<Box mb={5} />
				{transactions && transactions.length > 0 ? (
					transactions.map((transaction, idx) => (
						<React.Fragment key={`transaction-${idx}`}>
							<TouchableOpacity
								key={`userT-${idx}`}
								onPress={() =>
									navigation.navigate(ActivityRoutes.viewTransaccion, {
										ciudadanoId,
										transaccionId: transaction.id,
									})
								}
							>
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
									<HStack
										space={2}
										mt="0.5"
										key={`stack-${idx}`}
										alignItems="center"
									>
										<Text fontSize="sm">Transaccion #{transaction.id}</Text>
									</HStack>
									<HStack
										space={2}
										mt="0.5"
										key={`name-${idx}`}
										alignItems="center"
									>
										<Text fontSize="sm" numberOfLines={4}>
											Punto de reciclaje {transaction.puntoReciclajeId}
										</Text>
									</HStack>
									<HStack
										space={2}
										mt="0.5"
										key={`date-${idx}`}
										alignItems="center"
									>
										<Text fontSize="sm" numberOfLines={4}>
											{formatFecha(transaction.fechaCreacion, true)}
										</Text>
									</HStack>
									<HStack
										space={2}
										mt="0.5"
										key={`date-retiro-${idx}`}
										alignItems="center"
									>
										<Text fontSize="sm" numberOfLines={4}>
											{transaction.fechaRetiro && 'Ya completada'}
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
										{transaction.fechaRetiro && transaction.transporte && transaction.transporte?.pagoConfirmado 
											&& transaction.transporte?.entregaConfirmada ? (
											<>
												<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
													<CheckCircleIcon  size={5} color="green.600" />
													<Text style={{ fontSize: 14, textAlign: 'center' }}>
														¡Esta transaccion finalizo correctamente!
													</Text>
												</View>
											</>
										) : transaction.fechaRetiro && transaction.transporte && !transaction.transporte?.pagoConfirmado ? (
											<>
												<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
													<InfoOutlineIcon  size={5} color="green.600" />
													<Text style={{ fontSize: 14, textAlign: 'center' }}>
														Esperando que el transportista confirme el pago.
													</Text>
												</View>
											</>
										) : transaction.fechaRetiro && transaction.transporte && !transaction.transporte?.entregaConfirmada ? (
											<>
												<View style={{flexDirection: 'row', justifyContent: 'center'}} >
													<Button onPress={() => handleEntregada(transaction)} key={`btnEntregar-${idx}`}>
														Confirmar Entrega
													</Button>
												</View>
											</>
										) : !transaction.fechaRetiro && transaction.transporte ? (
											<>
												<View style={{flexDirection: 'row', justifyContent: 'center'}} >
													<Button onPress={() =>handleCancelarTransportista(transaction.id)} key={`btnCancelar-${idx}`}>
														Cancelar Transporte
													</Button>
												</View>
											</>
										) : !transaction.fechaRetiro && !transaction.transporte && (
											<>
												<View style={{flexDirection: 'row', justifyContent: 'center'}} >
													<Button
														onPress={() => handleSolicitarTransportista(transaction.id)} key={`btnSolicitar-${idx}`}>
														Solicitar Transportista
													</Button>
												</View>
											</>
										)}
									</View>
								</Box>
							</TouchableOpacity>
						</React.Fragment>
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
								No dispones de transacciones abiertas
							</Text>
						</View>
					</>
				)}
			</Center>
		</ScrollView>
	)
}
