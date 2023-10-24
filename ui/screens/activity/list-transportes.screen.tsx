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
import { Transporte } from '../../../services/types'
import { TransportistaService } from '../../../services/transportista.service'
import { UserService } from '../../../services/user.service'
import * as Location from 'expo-location'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ListTransportes'>

export const ListTransportes = ({ navigation, route }: Props) => {
	const toast = useToast()
	const { userId } = route.params
	const [isLoading, setLoading] = React.useState(true)
	const [transportes, setTransportes] = React.useState<Transporte[]>([])

	const loadData = async () => {
		setTransportes([]);
		const userTransportes = await TransportistaService.getAll({
		  sinTransportista: true,
		  entregaConfirmada: false,
		});
	  
		match(
		  userTransportes,
		  async t => {
			for (const transporte of t) {
			  if (!transporte.transaccion || !transporte.transaccion.puntoReciclaje) {
				const direccion = 'No pudimos obtener la dirección';
				transportes.push({ ...transporte, direccion });
				continue;
			  }
	  
			  const direccion = await getDirection(
				transporte.transaccion.puntoReciclaje.latitud,
				transporte.transaccion.puntoReciclaje.longitud
			  );
	  
			  transportes.push({ ...transporte, direccion });
			}
	  
			const transportesUnicos = transportes.filter(
				(transporte, index, self) =>
				  index ===
				  self.findIndex(
					(t) => t.id === transporte.id
				  )
			  );
		
			  setTransportes(transportesUnicos);
			setLoading(false);
		  },
		  e => setTransportes([])
		);
	  };

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

	const handleTomarTransporte = async (id) => {
		const user = await UserService.getCurrent()
		const error = await TransportistaService.tomarTransporte(id, user.transportistaId)
		match(
			error,
			async t => {
				loadData()
				toast.show({ description: 'Transporte tomado correctamente.' })
				const user = await UserService.getCurrent()
				navigation.navigate(ActivityRoutes.activity)
			},
			err => {
				loadData()
				toast.show({ description: "Ocurrio un error al tomar el transporte, reintenta." })
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
										<Text style={{ fontWeight: 'bold' }}>Precio sugerido:</Text>{' '}
										${transporte.precioSugerido.toFixed(2)}
									</Text>
								</HStack>
								<HStack space={2} mt="0.5" alignItems="center">
									<Text fontSize="sm" numberOfLines={4}>
										<Text style={{ fontWeight: 'bold' }}>Direccion entrega:</Text>{' '}
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
										<Button onPress={() => goMapaRecorrido(transporte)}>
											Ver en mapa
										</Button>
										<View style={{ marginHorizontal: 10 }} />
										<Button onPress={() => handleTomarTransporte(transporte.id)}>Tomar Transporte</Button>
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