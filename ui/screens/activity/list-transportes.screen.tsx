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
} from 'native-base'
import { match } from '../../../utils/either'
import { LoadingScreen } from '../../components/loading.component'
import { Transaccion, Transporte } from '../../../services/types'
import { TransportistaService } from '../../../services/transportista.service'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ListTransportes'>

export const ListTransportes = ({ navigation, route }: Props) => {
	const { userId } = route.params
	const [isLoading, setLoading] = React.useState(true)
	const [transportes, setTransportes] = React.useState<Transporte[]>([])

	const loadData = async () => {
		const userTransportes = await TransportistaService.getAll({
			sinTransportista: true,
            entregaConfirmada: false,
		})
		match(
			userTransportes,
			t => setTransportes(t),
			e => setTransportes([]),
		)
		setLoading(false)
	}

	const handleTomarTransporte = async () => {
		/*const residuosSeleccionados = selectedResiduos.map(
			index => userResiduos[index],
		)

		const puntoReciclajeId = props.point.id
		const errorMap: string[] = []
		const successMap: string[] = []
		for (const r of residuosSeleccionados) {
			const result = await ResiduoService.postSolicitarDeposito(
				r.id,
				puntoReciclajeId,
			)
			ifLeft(result, t => {
				userResiduos.forEach(residuo => {
					if (r.id == residuo.id) {
						successMap.push(residuo.descripcion)
					}
				})
			})
			ifRight(result, t => {
				userResiduos.forEach(residuo => {
					console.log(residuo.descripcion)
					if (r.id == residuo.id) {
						errorMap.push(residuo.descripcion)
					}
				})
			})
		}
		if (errorMap.length === 0) {
			setRetiroExitoso(true)
		} else {
			const successMessaje = `Solicitud generada con exito para estos residuos: ${successMap.join(
				', ',
			)}`
			const errorMessaje = `Ocurrió un error al generar la solicitud de estos residuos: ${errorMap.join(
				', ',
			)}`
			successMap.length === 0
				? setSuccessMsj(null)
				: setSuccessMsj(successMessaje)
			setErrorMsj(errorMessaje)
			setErrorRetiro(true)
		}
        */
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
										<Text style={{ fontWeight: 'bold' }}>Precio sugerido:</Text>{' '}
										${transporte.precioSugerido.toFixed(2)}
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
										<Button onPress={handleTomarTransporte}>Tomar Transporte</Button>
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
								No pudimos encontrar solicitudes de transportes.
							</Text>
						</View>
					</>
				)}
			</Center>
		</ScrollView>
	)
}