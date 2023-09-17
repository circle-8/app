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
	const handleEntregada = async (transporteId) => {
		const error = await TransportistaService.entregaConfirmada(transporteId)
		const error2 = await TransaccionService.fulfill(transporteId) 
		match(
			error,
			t => {},
			err => {
				toast.show({
					description: 'Ocurrio un error al confirmar la entrega, reintenta.',
				})
			},
		)
		match(
			error2,
			t => {toast.show({ description: 'Entrega confirmada correctamente.' })},
			err => {
				toast.show({
					description: 'Ocurrio un error al confirmar la entrega, reintenta.',
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
				toast.show({ description: 'Transporte solicitado correctamente.' })
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
		loadData()
	}, [])

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView alignContent="center">
			<Center w="100%">
				<Box mb={5} />
				{transactions && transactions.length > 0 ? (
					transactions.map((transaction, idx) => (
						<>
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
										{transaction.fechaRetiro == null &&
										transaction.transporteId != null ? (
											<>
												<View style={{flexDirection: 'row', justifyContent: 'space-between'}} >
													<Button onPress={() =>handleCancelarTransportista(transaction.id)} >
														Cancelar Transporte
													</Button>
													<View style={{ marginHorizontal: 10 }} />
													<Button onPress={() => handleEntregada(transaction.transporteId)} >
														Confirmar Entrega
													</Button>
												</View>
											</>
										) : (
											transaction.fechaRetiro == null &&
											transaction.transporteId == null && (
												<>
													<Button
														onPress={() => handleSolicitarTransportista(transaction.id)} >
														Solicitar Transportista
													</Button>
												</>
											)
										)}
									</View>
								</Box>
							</TouchableOpacity>
						</>
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
