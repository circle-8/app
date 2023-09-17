import React from 'react'
import { TouchableOpacity } from 'react-native'
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import { Box, Center, Flex, Modal, Row, Text, useToast } from 'native-base'
import { FontAwesome } from '@expo/vector-icons'
import { colors } from '../../../constants/styles'
import * as Location from 'expo-location'
import { LoadingScreen } from '../../components/loading.component'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MainRoutesParams } from '../../../constants/routes-reciclador'
import { RecorridoService } from '../../../services/recorrido.service'
import { UserService } from '../../../services/user.service'
import { Recorrido, Zona } from '../../../services/types'
import { caseMaybe, map, match } from '../../../utils/either'
import { ZonasService } from '../../../services/zonas.service'

type Coord = {
	latitude: number
	longitude: number
}

const latitudeDelta = 0.01
const longitudeDelta = 0.01

type Props = NativeStackScreenProps<MainRoutesParams, 'Home'>

export const HomeReciclador = ({ navigation }: Props) => {
	const toast = useToast()

	const [isLoading, setLoading] = React.useState(true)
	const [userCoords, setUserCoords] = React.useState<Coord>()
	const [todayRecorrido, setTodayRecorrido] = React.useState<Recorrido>()
	const [currentPoint, setCurrentPoint] = React.useState<number>(0)
	const [region, setRegion] = React.useState<{
		latitude: number
		longitude: number
		latitudeDelta: number
		longitudeDelta: number
	}>()
	const [address, setAddress] =
		React.useState<Location.LocationGeocodedAddress>()
	const [zonas, setZonas] = React.useState<Zona[]>()

	const getRecorridos = async (userCoords: Coord) => {
		const user = await UserService.getCurrent()
		const recorridos = await RecorridoService.list({
			recicladorId: user.recicladorUrbanoId,
			fechaRetiro: new Date(), // today
		})
		let recorrido: Recorrido
		match(
			recorridos,
			rr => {
				recorrido = rr.filter(r => !r.endDate && r.puntos.length > 0)[0]
				setTodayRecorrido(recorrido)
			},
			err => {
				toast.show({ description: err })
			},
		)
		if (recorrido && recorrido.initDate) {
			const res = await RecorridoService.get(recorrido.id)
			match(
				res,
				r => {
					setTodayRecorrido(r)
					setRegion({
						latitude: r.puntos[0]?.latitud || r.puntoInicio.latitud,
						longitude: r.puntos[0]?.longitud || r.puntoInicio.longitud,
						latitudeDelta,
						longitudeDelta,
					})
				},
				err => toast.show({ description: err }),
			)
		} else {
			setRegion({
				...userCoords,
				latitudeDelta,
				longitudeDelta,
			})
		}
	}

	const getUserLocation = async () => {
		const status = await Location.requestForegroundPermissionsAsync()
		if (status.granted) {
			const p = await Location.getCurrentPositionAsync()

			setUserCoords({
				latitude: p.coords.latitude,
				longitude: p.coords.longitude,
			})
			return {
				latitude: p.coords.latitude,
				longitude: p.coords.longitude,
			}
		}
	}

	const getZonas = async () => {
		const user = await UserService.getCurrent()
		const zonas = await ZonasService.getAll({
			recicladorId: user.recicladorUrbanoId,
		})
		match(
			zonas,
			t => setZonas(t),
			err => {
				toast.show({ description: err })
			},
		)
	}

	const initialLoad = async () => {
		const userCoords: Coord = await getUserLocation()
		await getRecorridos(userCoords)
		await getZonas()
		setLoading(false)
	}

	/* Initial data loading */
	React.useEffect(() => {
		initialLoad()
	}, [])

	if (isLoading) {
		return <LoadingScreen />
	}

	const onInit = async () => {
		const error = await RecorridoService.init(todayRecorrido.id)
		caseMaybe(
			error,
			err => toast.show({ description: err }),
			async () => {
				const res = await RecorridoService.get(todayRecorrido.id)
				match(
					res,
					r => setTodayRecorrido(r),
					err => toast.show({ description: err }),
				)
			},
		)
	}

	const onFinish = async () => {
		const error = await RecorridoService.finish(todayRecorrido.id)
		caseMaybe(
			error,
			err => toast.show({ description: err }),
			() => {
				toast.show({ description: 'Recorrido finalizado' })
				setTodayRecorrido(undefined)
			},
		)
	}

	const getAddress = async (coord: Coord) => {
		const location = await Location.reverseGeocodeAsync(coord)
		if (location.length > 0) {
			setAddress(location[0])
		}
	}

	const mapHeight = todayRecorrido?.initDate || false ? '70%' : '85%'
	const boxHeight = todayRecorrido?.initDate || false ? '10%' : '15%'

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
						provider={PROVIDER_GOOGLE}
						// onRegionChange={setRegion}
					>
						{todayRecorrido && (
							<Marker
								key="initial"
								coordinate={{
									latitude: todayRecorrido.puntoInicio.latitud,
									longitude: todayRecorrido.puntoInicio.longitud,
								}}
								title="Inicio del recorrido"
							/>
						)}
						{todayRecorrido && (
							<Marker
								key="end"
								coordinate={{
									latitude: todayRecorrido.puntoFin.latitud,
									longitude: todayRecorrido.puntoFin.longitud,
								}}
								title="Fin del recorrido"
							/>
						)}
						{todayRecorrido?.puntos?.map(p => (
							<Marker
								key={`${p.residuo.id}`}
								coordinate={{
									latitude: p.latitud,
									longitude: p.longitud,
								}}
								pinColor={colors.byType['RESIDUO']}
							/>
						))}
						{todayRecorrido?.puntos && (
							<Polyline
								coordinates={[
									{
										latitude: todayRecorrido.puntoInicio.latitud,
										longitude: todayRecorrido.puntoInicio.longitud,
									},
									...todayRecorrido.puntos.map(p => ({
										latitude: p.latitud,
										longitude: p.longitud,
									})),
									{
										latitude: todayRecorrido.puntoFin.latitud,
										longitude: todayRecorrido.puntoFin.longitud,
									},
								]}
							/>
						)}
						{zonas &&
							zonas.length > 0 &&
							zonas.map((zona, idx) => (
								<Polygon
									key={`polygon-${idx}`}
									coordinates={zona.polyline.map(coord => ({
										latitude: coord.latitud,
										longitude: coord.longitud,
									}))}
									strokeColor="#8CB085"
									fillColor="rgba(132, 209, 121, 0.2)"
									strokeWidth={2}
									tappable={true}
								/>
							))}
						<ZonasReciclador zonas={zonas} />
					</MapView>
				</Box>
				{todayRecorrido && todayRecorrido.initDate && (
					<Box height="20%" bgColor="white" p="10" borderBottomWidth="0.5">
						<Text>
							{todayRecorrido.puntos[currentPoint]?.residuo.descripcion}
						</Text>
						<Text>
							{todayRecorrido.puntos[currentPoint]?.residuo.tipoResiduo.nombre}
						</Text>
						<Text>
							{address?.street} {address?.streetNumber}
						</Text>
						<Text>
							{todayRecorrido.puntos[currentPoint]?.residuo.fechaRetiro
								? 'Ya ha sido retirado'
								: 'Todavia no retirado'}
						</Text>
					</Box>
				)}
				<Center height={boxHeight} bgColor="white">
					<BelowBox
						recorrido={todayRecorrido}
						currentPoint={currentPoint}
						onInit={onInit}
						onFinish={onFinish}
						onPrevious={async () => {
							const newPoint = currentPoint > 0 ? currentPoint - 1 : 0
							setCurrentPoint(newPoint)
							await getAddress({
								latitude: todayRecorrido.puntos[newPoint].latitud,
								longitude: todayRecorrido.puntos[newPoint].longitud,
							})
							setRegion({
								latitude: todayRecorrido.puntos[newPoint].latitud,
								longitude: todayRecorrido.puntos[newPoint].longitud,
								latitudeDelta,
								longitudeDelta,
							})
						}}
						onNext={async () => {
							const newPoint =
								currentPoint + 1 < todayRecorrido.puntos.length
									? currentPoint + 1
									: currentPoint
							setCurrentPoint(newPoint)
							await getAddress({
								latitude: todayRecorrido.puntos[newPoint].latitud,
								longitude: todayRecorrido.puntos[newPoint].longitud,
							})
							setRegion({
								latitude: todayRecorrido.puntos[newPoint].latitud,
								longitude: todayRecorrido.puntos[newPoint].longitud,
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
	recorrido?: Recorrido
	currentPoint: number
	onInit: () => void
	onFinish: () => void
	onPrevious: () => void
	onNext: () => void
}

const BelowBox = ({
	recorrido,
	currentPoint,
	onInit,
	onFinish,
	onPrevious,
	onNext,
}: BeloxBoxParams) => {
	let content: JSX.Element
	if (!recorrido) {
		content = (
			<Center w="33%">
				<Text fontSize="xs">No tienes recorridos para hoy</Text>
			</Center>
		)
	} else if (!recorrido.initDate) {
		content = (
			<Center w="33%">
				<TouchableOpacity onPress={onInit}>
					<FontAwesome name="recycle" size={40} color={colors.primary800} />
				</TouchableOpacity>
				<Text fontSize="xs">Iniciar Recorrido</Text>
			</Center>
		)
	} else {
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
								currentPoint == recorrido.puntos.length - 1
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
	}

	return <Row alignContent="center">{content}</Row>
}

type ZonasRecicladorProps = {
	zonas: Zona[]
}

const ZonasReciclador = (props: ZonasRecicladorProps) => {

	return (
		<>
			{props.zonas && props.zonas.length > 0 ? (
					props.zonas.map((zona, idx) => (
						<Polygon
							key={`polygon-${idx}`}
							coordinates={zona.polyline.map(coord => ({
								latitude: coord.latitud,
								longitude: coord.longitud,
							}))}
							strokeColor="#8CB085"
							fillColor="rgba(132, 209, 121, 0.2)"
							strokeWidth={2}
							tappable={true}
						/>
					))
				) :  (
				''
			)}
		</>
	)
}
