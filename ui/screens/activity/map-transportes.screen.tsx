import React from 'react'
import { Platform, TouchableOpacity, Image } from 'react-native'
import MapView, { Marker, Polygon, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'
import { Box, Center, Flex, Modal, Row, ScrollView, Text, View, useToast } from 'native-base'
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons'
import { colors } from '../../../constants/styles'
import * as Location from 'expo-location'
import { LoadingScreen } from '../../components/loading.component'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { UserService } from '../../../services/user.service'
import { Transaccion, Transporte } from '../../../services/types'
import { caseMaybe, map, match } from '../../../utils/either'
import { ActivityRouteParams, ActivityRoutes } from '../../../constants/routes'
import { TransaccionService } from '../../../services/transaccion.service'
import { TransportistaService } from '../../../services/transportista.service'
import MapViewDirections from 'react-native-maps-directions';

type Coord = {
	latitude: number
	longitude: number
}

const latitudeDelta = 0.01
const longitudeDelta = 0.01

type Props = NativeStackScreenProps<ActivityRouteParams, 'MapTransportes'>

export const MapTransportes = ({ navigation, route }: Props) => {
	const toast = useToast()
	const { transporte } = route.params
	const [isView, setIsView] = React.useState(true)
	const [isLoading, setLoading] = React.useState(true)
	const [userCoords, setUserCoords] = React.useState<Coord>()
	const [transaccion, setTransaccion] = React.useState<Transaccion>()
	const [currentPoint, setCurrentPoint] = React.useState<number>(0)
	const [region, setRegion] = React.useState<{
		latitude: number
		longitude: number
		latitudeDelta: number
		longitudeDelta: number
	}>()
	const [address, setAddress] = React.useState<Location.LocationGeocodedAddress>()
	const [viewImage, setViewImage] = React.useState(false)

	const getRecorridos = async () => {
		const getTransaction = await TransaccionService.get(transporte.transaccionId)
		match(
			getTransaction,
			t => {
				setTransaccion(t)
				setRegion({
					latitude: t.residuos[0]?.puntoResiduo.latitud || userCoords.latitude,
					longitude:  t.residuos[0]?.puntoResiduo.longitud || userCoords.longitude,
					latitudeDelta,
					longitudeDelta,
				})
				const coord: Coord = {latitude: t.residuos[0]?.puntoResiduo.latitud || 0, 
								longitude: t.residuos[0]?.puntoResiduo.longitud || 0, 
			  }
				getAddress(coord)
			},
			err => {
				toast.show({ description: err })
				navigation.navigate(ActivityRoutes.activity)
			},
		)
	}

	const getUserLocation = async () => {
		const status = await Location.requestForegroundPermissionsAsync()
		if (status.granted) {
			const p = await Location.getCurrentPositionAsync()

			setUserCoords({
				latitude: p.coords.latitude,
				longitude: p.coords.longitude,
			})
		}
	}

	const getAddress = async (coord: Coord) => {
		const location = await Location.reverseGeocodeAsync(coord)
		if (location.length > 0) {
			setAddress(location[0])
		} 
	}

	const initialLoad = async () => {
		try {
			const getRecorridosPromise = getRecorridos();
			const getUserLocationPromise = getUserLocation();
		
			await Promise.all([getRecorridosPromise, getUserLocationPromise]);
		
			setLoading(false);
		  } catch (error) {
			toast.show({ description: 'Ocurrio un error al cargar el mapa, reintenta' })
			navigation.navigate(ActivityRoutes.activity)
		  }
	}

	const onFinish = async () => {
		const user = await UserService.getCurrent()
		const error = await TransportistaService.finish(transporte.id)
		caseMaybe(
			error,
			err => toast.show({ description: err }),
			() => {
				toast.show({ description: 'Transporte finalizado' })
				navigation.navigate(ActivityRoutes.listMisTransportes, {
					userId: user.id,
				})
			},
		)
	}

	const verFoto = () => {
		setViewImage(!viewImage)
	}

	/* Initial data loading */
	React.useEffect(() => {
		initialLoad()
	}, [])

	if (isLoading) {
		return <LoadingScreen />
	}

	const mapHeight = transporte?.fechaInicio || false ? '65%' : '85%'
	const boxHeight = transporte?.fechaInicio || false ? '15%' : '15%'

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: colors.primary50 }}
			edges={['top']}
		>
			<Flex h="100%">
				<Box height={mapHeight}>
					<MapView
						style={{ width: '100%', height: '100%' }}
						showsUserLocation
						showsMyLocationButton
						region={region}
						provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
						// onRegionChange={setRegion}
					>
						{isView && (
							<Marker
								key="initial"
								coordinate={{
									latitude: userCoords.latitude,
									longitude: userCoords.longitude,
								}}
								title="Inicio del recorrido"
							/>
						)}
						{isView && (
							<Marker
								key="end"
								coordinate={{
									latitude: transporte.transaccion.puntoReciclaje.latitud,
									longitude: transporte.transaccion.puntoReciclaje.longitud,
								}}
								title="Fin del recorrido"
							/>
						)}
						{transaccion?.residuos?.map(p => (
							<Marker
								key={`${p.id}`}
								coordinate={{
									latitude: p.puntoResiduo.latitud,
									longitude: p.puntoResiduo.longitud,
								}}
								pinColor={colors.byType['RESIDUO']}
							/>
						))}
						{transaccion?.residuos && (
							<MapViewDirections
							origin={{ latitude: userCoords.latitude, longitude: userCoords.longitude }}
							waypoints={transaccion?.residuos?.map(p => ({
								latitude: p.puntoResiduo.latitud,
								longitude: p.puntoResiduo.longitud,
							}))}
							destination={{
							  latitude: transporte.transaccion.puntoReciclaje.latitud,
							  longitude: transporte.transaccion.puntoReciclaje.longitud
							}}
							apikey={"AIzaSyAIi9hhuW6G0MPmseIiKQDphVTRC7u3oPU"}
							strokeWidth={2}
							strokeColor="green"
							/>
						)}
					</MapView>
				</Box>
				{transaccion && transaccion?.residuos && (
					<Box height="20%" bgColor="white" p="5" borderBottomWidth="0.5">
						<ScrollView persistentScrollbar={true}>
							<Text style={{ fontWeight: 'bold' }}>
								{'\u2022'}  Residuo {currentPoint + 1} de {transaccion.residuos.length}
							</Text>
							<Text>
								{'\u2022'} <Text style={{ fontWeight: 'bold' }}>Dirección:</Text> {address?.street ? address?.street : 'No se pudo obtener la direccion'} {address?.streetNumber ? address?.streetNumber : ""} 
							</Text>
							<Text>
								{'\u2022'} <Text style={{ fontWeight: 'bold' }}>Tipo:</Text> {transaccion.residuos[currentPoint]?.tipoResiduo.nombre}
							</Text>
							<Text>
								{'\u2022'} <Text style={{ fontWeight: 'bold' }}>Descripcion:</Text> {transaccion.residuos[currentPoint]?.descripcion}
							</Text>
							<Text>
								{'\u2022'} <Text style={{ fontWeight: 'bold' }}>Estado:</Text> {transaccion.residuos[currentPoint]?.fechaRetiro? 'Ya ha sido retirado' : 'Todavia no retirado'}
							</Text>
							{transaccion.residuos[currentPoint]?.base64 && (
									<>
										<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }} >
											<View style={{ padding: 5, marginLeft: 15 }}>
												<TouchableOpacity onPress={verFoto}>
													<FontAwesome5 name="image" size={28} alignSelf="center" />
													<Text textAlign="center" style={{ fontSize: 7 }} numberOfLines={4} fontWeight="bold" color="#41483F">
														{viewImage ? 'Ocultar foto' : 'Ver foto'}
													</Text>
												</TouchableOpacity>
											</View>
											{viewImage && (
												<View style={{ borderWidth: 2, borderColor: 'green', padding: 5, marginLeft: 15, borderRadius: 5 }}>
													<Image source={{ uri: 'data:image/jpeg;base64,' + transaccion.residuos[currentPoint]?.base64 }} style={{ width: 200, height: 200 }} />
												</View>
											)}
										</View>
									</>
								)}
						</ScrollView>
					</Box>
				)}
				<Center height={boxHeight} bgColor="white">
					<BelowBox
						transaccion={transaccion}
						transporte={transporte}
						currentPoint={currentPoint}
						onFinish={onFinish}
						onPrevious={async () => {
							const newPoint = currentPoint > 0 ? currentPoint - 1 : 0
							setCurrentPoint(newPoint)
							await getAddress({
								latitude: transaccion.residuos[newPoint].puntoResiduo.latitud,
								longitude: transaccion.residuos[newPoint].puntoResiduo.longitud,
							})
							setRegion({
								latitude: transaccion.residuos[newPoint].puntoResiduo.latitud,
								longitude: transaccion.residuos[newPoint].puntoResiduo.longitud,
								latitudeDelta,
								longitudeDelta,
							})
						}}
						onNext={async () => {
							const newPoint =
								currentPoint + 1 < transaccion.residuos.length
									? currentPoint + 1
									: currentPoint
							setCurrentPoint(newPoint)
							await getAddress({
								latitude: transaccion.residuos[newPoint].puntoResiduo.latitud,
								longitude: transaccion.residuos[newPoint].puntoResiduo.longitud,
							})
							setRegion({
								latitude: transaccion.residuos[newPoint].puntoResiduo.latitud,
								longitude: transaccion.residuos[newPoint].puntoResiduo.longitud,
								latitudeDelta,
								longitudeDelta,
							})
						}}
					/>
				</Center>
			</Flex>
		</SafeAreaView>
	)
}

type BeloxBoxParams = {
	transaccion?: Transaccion
	transporte?: Transporte
	currentPoint: number
	onFinish: () => void
	onPrevious: () => void
	onNext: () => void
}

const BelowBox = ({
	transaccion,
	transporte,
	currentPoint,
	onFinish,
	onPrevious,
	onNext,
}: BeloxBoxParams) => {
	let content: JSX.Element
		content = (
			<>
				<Center w="33%">
					<TouchableOpacity onPress={onPrevious}>
						<FontAwesome
							name="caret-left"
							size={50}
							color={currentPoint == 0 ? 'lightgray' : colors.primary800}
						/>
					</TouchableOpacity>
					<Text fontSize="xs">Anterior</Text>
				</Center>
				<Center w="33%">
					<TouchableOpacity onPress={onNext}>
						<FontAwesome
							name="caret-right"
							size={50}
							color={
								currentPoint == transaccion.residuos.length - 1
									? 'lightgray'
									: colors.primary800
							}
						/>
					</TouchableOpacity>
					<Text fontSize="xs">Siguiente</Text>
				</Center>
				<Center w="33%">
					<TouchableOpacity onPress={onFinish}>
						<FontAwesome name="close" size={50} color={colors.primary800} />
					</TouchableOpacity>
					<Text fontSize="xs">Terminar</Text>
				</Center>
			</>
		)

	return <Row alignContent="center">{content}</Row>
}