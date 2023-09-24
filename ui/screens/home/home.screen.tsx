import React from 'react'
import { GestureResponderEvent, Linking, Platform, TouchableOpacity } from 'react-native'
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, PROVIDER_DEFAULT  } from 'react-native-maps'
import {
	Box,
	Center,
	Flex,
	Row,
	Text,
	Modal,
	Checkbox,
	Button,
	View,
	HStack,
	CircleIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	Spinner,
	InfoOutlineIcon,
	WarningOutlineIcon,
	CheckCircleIcon,
	useToast,
} from 'native-base'
import Ionicons from '@expo/vector-icons/Ionicons'
import { FontAwesome } from '@expo/vector-icons'
import { colors } from '../../../constants/styles'
import * as Location from 'expo-location'
import { LoadingScreen } from '../../components/loading.component'
import { PuntoService } from '../../../services/punto.service'
import {
	Punto,
	PuntoReciclaje,
	PuntoResiduo,
	PuntoVerde,
	TipoPunto,
	TipoResiduo,
	Zona,
} from '../../../services/types'
import { SafeAreaView } from 'react-native-safe-area-context'
import { mapDays } from '../../../utils/days'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
	ActivityRoutes,
	MainRoutesParams,
	ProfileRoutes,
	TabRoutes,
} from '../../../constants/routes'
import { UserService } from '../../../services/user.service'
import { match, ifLeft, ifRight } from '../../../utils/either'
import { TipoResiduoService } from '../../../services/tipos.service'
import { PolylineResponse, ResiduoResponse } from '../../../services/responses'
import { ResiduoService } from '../../../services/residuo.service'
import { ZonasService } from '../../../services/zonas.service'

type Coord = {
	latitude: number
	longitude: number
}

const latitudeDelta = 0.01
const longitudeDelta = 0.01

type Props = NativeStackScreenProps<MainRoutesParams, 'Home'>

export const Home = ({ navigation }: Props) => {
	const toast = useToast()
	const [isLoading, setLoading] = React.useState(true)
	const [userCoords, setUserCoords] = React.useState<Coord>()
	const [points, setPoints] = React.useState<Punto[]>([])
	const [isFilterOpen, setFilterIsOpen] = React.useState(false)
	const [selectedPuntos, setSelectedPuntos] = React.useState<TipoPunto[]>([
		'VERDE',
		'RECICLAJE',
		'RESIDUO'
	])
	const [selectedTipos, setSelectedTipos] = React.useState<string[]>([])
	const [selectedDias, setSelectedDias] = React.useState<string[]>([])
	const [puntoReciclaje, setPuntoReciclaje] = React.useState<PuntoReciclaje>()
	const [showCheckboxesPuntos, setShowCheckboxesPuntos] = React.useState(false)
	const [showCheckboxesTipos, setShowCheckboxesTipos] = React.useState(false)
	const [showCheckboxesDias, setShowCheckboxesDias] = React.useState(false)
	const [puntoResiduo, setPuntoResiduo] = React.useState<PuntoResiduo>()
	const [direction, setDirection] = React.useState('')
	const [isLoadingModal, setIsLoadingModal] = React.useState(true)
	const [tipos, setTipos] = React.useState<TipoResiduo[]>()
	const [zonas, setZonas] = React.useState<Zona[]>()
	const [isViewZonas, setIsViewZonas] = React.useState(false)
	/* Para circuitos */
	const [zonasSelected, setZonasSelected] = React.useState<Zona[] | null>(null)
	const [modalZonaSelected, setModalZonaSelected] = React.useState(false)
	const [modalJoin, setModalJoin] = React.useState(false)
	const [modalFirstStep, setModalFirstStep] = React.useState(false)
	const [zonaToJoin, setZonaToJoin] = React.useState<Zona | null>(null)
	const [modalExito, setModalExito] = React.useState(false)
	const [modalError, setModalError] = React.useState(false)
	const [selectedUserPoint, setSelectedUserPoint] = React.useState<
		number | null
	>(null)
	const handleCloseModal = () => {
		setSelectedUserPoint(null)
		setZonaToJoin(null)
		setModalZonaSelected(false)
		setModalJoin(false)
		setModalFirstStep(false)
		setModalError(false)
		setModalExito(false)
	}

	const getUserLocation = async () => {
		const status = await Location.requestForegroundPermissionsAsync()
		if (status.granted) {
			const p = await Location.getCurrentPositionAsync()

			setUserCoords({
				latitude: p.coords.latitude,
				longitude: p.coords.longitude,
			})
			setLoading(false)
		}
		// TODO: que hacer si no da permisos (no funcionar, por ejemplo)
	}

	const getPuntoResiduo = async (id, ciudadanoId) => {
		const p = await PuntoService.getPuntoResiduo(id, ciudadanoId)
		match(
			p,
			punto => {
				setPuntoResiduo(punto)
			},
			err => {
				toast.show({ description: err })
			},
		)
	}

	const getPoints = async () => {
		const newPoints = await PuntoService.getAll({
			tipos: selectedPuntos,
			residuos: selectedTipos,
			dias: selectedDias,
		})
		setPoints(newPoints)
	}

	const getTipos = async () => {
		const tipos = await TipoResiduoService.getAll()
		match(
			tipos,
			t => setTipos(t),
			err => {
				toast.show({ description: err })
			},
		)
	}

	const getDirection = async (latitude, longitude) => {
		try {
			setIsLoadingModal(true)
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

			setDirection(address)
			setIsLoadingModal(false)
		} catch (error) {
			setDirection('No podemos brindar la direccion.')
			setIsLoadingModal(false)
		}
	}

	const handleFilterPress = () => {
		setFilterIsOpen(!isFilterOpen)
	}

	const closePopover = () => {
		setFilterIsOpen(false)
	}

	const handleFiltroPress = filter => {
		if (filter == 'Puntos') setShowCheckboxesPuntos(!showCheckboxesPuntos)
		if (filter == 'Tipos') setShowCheckboxesTipos(!showCheckboxesTipos)
		if (filter == 'Dias') setShowCheckboxesDias(!showCheckboxesDias)
	}

	const handleEntregarResiduos = async () => {
		const user = await UserService.getCurrent()
		const points = await PuntoService.getAll({
			tipos: ['RESIDUO'],
			ciudadanoId: user.ciudadanoId,
		})

		if (points.length === 0) {
			// Si no tiene puntos de residuos, ir directo a crear uno
			navigation.navigate(TabRoutes.profile, {
				screen: ProfileRoutes.editPuntoResiduo,
				initial: false,
				params: {
					ciudadanoId: user.ciudadanoId,
				},
			})
		} else {
			// Si ya tiene, ir al menu de activity para crear un residuo
			navigation.navigate(TabRoutes.activity, {
				screen: ActivityRoutes.newResiduo,
				initial: false,
				params: {
					ciudadanoId: user.ciudadanoId,
					puntoResiduoId: points[0].id,
				},
			})
		}
	}

	const handleGetZonas = async () => {
		const getZonas = await ZonasService.getAll({})
		match(
			getZonas,
			t => {
				if (t.length === 0) {
					toast.show({ description: 'No hay circuitos activos.' })
				} else {
					setPuedeUnirseZona(t)
				}
			},
			err => {
				toast.show({
					description: 'Ocurrio un error al obtener los circuitos, reintenta.',
				})
			},
		)
		setIsViewZonas(!isViewZonas)
	}

	const setPuedeUnirseZona = async (zonas: Zona[]) => {
		const user = await UserService.getCurrent()
		const puntosResiduoUser = await PuntoService.getAll({
			tipos: ['RESIDUO'],
			ciudadanoId: user.ciudadanoId,
		})

		if (zonas != null && puntosResiduoUser != null) {
			const zonasActualizadas: Zona[] = []
			zonas.forEach(zona => {
				const zonaActualizada: Zona = {
					...zona,
					puedeUnirse: false,
					puntosDentroZona: [],
				}
				const puntosSet = new Set()

				puntosResiduoUser.forEach(point => {
					const intersecta = isPointInsideZone(point, zona)

					if (intersecta && !puntosSet.has(point.id)) {
						puntosSet.add(point.id)
						zonaActualizada.puedeUnirse = true
						zonaActualizada.puntosDentroZona.push(point)
					}
				})

				zonasActualizadas.push(zonaActualizada)
			})

			setZonas(zonasActualizadas)
		}
	}

	const isPointInsideZone = (point, zone) => {
		let inside = false
		const x = point.latitud
		const y = point.longitud

		const n = zone.polyline.length
		for (let i = 0, j = n - 1; i < n; j = i++) {
			const xi = zone.polyline[i].latitud
			const yi = zone.polyline[i].longitud
			const xj = zone.polyline[j].latitud
			const yj = zone.polyline[j].longitud

			const intersecta =
				yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

			if (intersecta) {
				inside = !inside
			}
		}

		return inside
	}

	/* Initial data loading */
	React.useEffect(() => {
		getUserLocation()
		getPoints()
		getTipos()
	}, [])

	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: colors.primary50 }}
			edges={['top']}
		>
			<Flex h="100%">
				<Box height="75%">
					<MapView
						style={{ width: '100%', height: '100%' }}
						showsUserLocation
						showsMyLocationButton
						initialRegion={{
							latitude: userCoords.latitude,
							longitude: userCoords.longitude,
							latitudeDelta,
							longitudeDelta,
						}}
						provider={
							Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE
						}
					>
						<CircuitosReciclaje
							isViewZonas={isViewZonas}
							zonas={zonas}
							setZonasSelected={setZonasSelected}
							setModalZonaSelected={setModalZonaSelected}
							setModalFirstStep={setModalFirstStep}
							setSelectedUserPoint={setSelectedUserPoint}
							setZonaToJoin={setZonaToJoin}
							setModalJoin={setModalJoin}
							setModalError={setModalError}
							setModalExito={setModalExito}
							handleCloseModal={handleCloseModal}
						/>
						{points.map(point => (
							<Marker
								key={`${point.tipo}-${point.id}`}
								coordinate={{
									latitude: point.latitud,
									longitude: point.longitud,
								}}
								title={point.titulo}
								pinColor={colors.byType[point.tipo]}
								onCalloutPress={() => {
									if (point.tipo === 'RECICLAJE' || point.tipo === 'VERDE') {
										setPuntoReciclaje(point as PuntoReciclaje)
									} else {
										setPuntoResiduo(point as PuntoResiduo)
									}
								}}
							/>
						))}
					</MapView>
				</Box>
				<Box position="absolute" top={10} left={0} p={4}>
					<Filter onPress={handleFilterPress} />
				</Box>
				<FiltrosModal
					isOpen={isFilterOpen}
					onClose={closePopover}
					handleFiltroPress={handleFiltroPress}
					showCheckboxesPuntos={showCheckboxesPuntos}
					showCheckboxesTipos={showCheckboxesTipos}
					showCheckboxesDias={showCheckboxesDias}
					selectedPuntos={selectedPuntos}
					setSelectedPuntos={setSelectedPuntos}
					selectedTipos={selectedTipos}
					setSelectedTipos={setSelectedTipos}
					selectedDias={selectedDias}
					setSelectedDias={setSelectedDias}
					getPoints={getPoints}
					tipos={tipos}
				/>
				<PuntoReciclajeModal
					show={!!puntoReciclaje}
					onClose={() => setPuntoReciclaje(undefined)}
					point={puntoReciclaje}
					isLoadingModal={isLoadingModal}
					direction={direction}
					getDirection={getDirection}
					navigation={navigation}
					crearResiduo={handleEntregarResiduos}
				/>
				<PuntoResiduoModal
					show={!!puntoResiduo}
					onClose={() => setPuntoResiduo(undefined)}
					point={puntoResiduo}
					isLoadingModal={isLoadingModal}
					direction={direction}
					getDirection={getDirection}
					getPuntoResiduo={getPuntoResiduo}
					navigation={navigation}
				/>
				<ModalZonas
					modalZonaSelected={modalZonaSelected}
					modalJoin={modalJoin}
					zonaToJoin={zonaToJoin}
					isLoadingModal={isLoadingModal}
					setZonaToJoin={setZonaToJoin}
					setModalJoin={setModalJoin}
					setModalFirstStep={setModalFirstStep}
					setModalExito={setModalExito}
					setModalError={setModalError}
					handleCloseModal={handleCloseModal}
					modalExito={modalExito}
					modalError={modalError}
					modalFirstStep={modalFirstStep}
					zonasSelected={zonasSelected}
					selectedUserPoint={selectedUserPoint}
					setSelectedUserPoint={setSelectedUserPoint}
					navigation={navigation}
				/>
				<Center height="25%" bgColor="white">
					<Row justifyContent="space-between" mt="0" height={120}>
						<TouchableOpacity
							style={{ alignItems: 'center', width: '33%' }}
							onPress={() => {
								handleEntregarResiduos()
							}}
						>
							<View style={{ alignItems: 'center', marginTop: 0 }}>
								<Ionicons name="trash" size={40} color={colors.primary800} />
							</View>
							<View style={{ alignItems: 'center', marginTop: 0 }}>
								<Text fontSize="xs" fontWeight="bold">
									Entregar residuos
								</Text>
							</View>
							<View style={{ alignItems: 'center', marginTop: 2 }}>
								<Text style={{ fontSize: 10, textAlign: 'center' }}>
									Entrega tus residuos a quien lo necesiten.
								</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							style={{ alignItems: 'center', width: '32%' }}
							onPress={() =>
								navigation.navigate('ProfileTab', {
									screen: 'ListPuntoReciclaje',
									initial: false,
								})
							}
						>
							<View style={{ alignItems: 'center', marginTop: 1 }}>
								<FontAwesome
									name="recycle"
									size={40}
									color={colors.primary800}
								/>
							</View>
							<View style={{ alignItems: 'center', marginTop: 4 }}>
								<Text fontSize="xs" fontWeight="bold">
									Recibir residuos
								</Text>
							</View>
							<View style={{ alignItems: 'center', marginTop: 2 }}>
								<Text style={{ fontSize: 10, textAlign: 'center' }}>
									Crea puntos para recibir residuos que te interesen.
								</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							style={{ alignItems: 'center', width: '34%' }}
							onPress={() => handleGetZonas()}
						>
							<View style={{ alignItems: 'center', marginTop: 1 }}>
								<Ionicons name="leaf" size={40} color={colors.primary800} />
							</View>
							<View style={{ alignItems: 'center', marginTop: 1 }}>
								<Text fontSize="xs" fontWeight="bold">
									Circuitos de Reciclaje
								</Text>
							</View>
							<View style={{ alignItems: 'center', marginTop: 2 }}>
								<Text style={{ fontSize: 10, textAlign: 'center' }}>
									Sumate a recorridos que retiren tus residuos.
								</Text>
							</View>
						</TouchableOpacity>
					</Row>
				</Center>
			</Flex>
		</SafeAreaView>
	)
}

type FilterProps = {
	onPress: (event: GestureResponderEvent) => void
}

const Filter = (props: FilterProps) => {
	return (
		<TouchableOpacity onPress={props.onPress}>
			<Center width={60} height={60} bg={colors.primary800} rounded="full">
				<FontAwesome name="filter" size={40} color={colors.primary100} />
			</Center>
		</TouchableOpacity>
	)
}

type PuntoConDireccion = {
	punto: Punto
	address: string
}

type CircuitosReciclajeProps = {
	isViewZonas: boolean
	zonas: Zona[]
	setZonasSelected: (z: Zona[]) => void
	setModalZonaSelected: (b: boolean) => void
	setModalFirstStep: (b: boolean) => void
	setSelectedUserPoint: (idx: number | null) => void
	setZonaToJoin: (z: Zona | null) => void
	setModalJoin: (b: boolean) => void
	setModalError: (b: boolean) => void
	setModalExito: (b: boolean) => void
	handleCloseModal: () => void
}

const CircuitosReciclaje = (props: CircuitosReciclajeProps) => {
	const handleZonaPress = (zonaSeleccionada: Zona) => {
		const zonasSelected = encontrarPoligonosSuperpuestos(zonaSeleccionada)

		props.setZonasSelected(zonasSelected)

		props.setModalZonaSelected(true)

		props.setModalFirstStep(true)
	}

	const encontrarPoligonosSuperpuestos = (zonaSeleccionada: Zona): Zona[] => {
		const superpuestos = props.zonas.filter(zona =>
			poligonosSeSuperponen(zonaSeleccionada.polyline, zona.polyline),
		)

		return superpuestos
	}

	const poligonosSeSuperponen = (
		poligono1: PolylineResponse[],
		poligono2: PolylineResponse[],
	): boolean => {
		// Función para determinar si dos circuitos se intersectan
		const intersectan = (
			p1: PolylineResponse,
			p2: PolylineResponse,
			p3: PolylineResponse,
			p4: PolylineResponse,
		): boolean => {
			const d1 = direccion(p3, p4, p1)
			const d2 = direccion(p3, p4, p2)
			const d3 = direccion(p1, p2, p3)
			const d4 = direccion(p1, p2, p4)

			if (d1 !== d2 && d3 !== d4) {
				return true
			}

			if (d1 === 0 && enSegmento(p3, p4, p1)) {
				return true
			}

			if (d2 === 0 && enSegmento(p3, p4, p2)) {
				return true
			}

			if (d3 === 0 && enSegmento(p1, p2, p3)) {
				return true
			}

			if (d4 === 0 && enSegmento(p1, p2, p4)) {
				return true
			}

			return false
		}

		// Función para determinar la dirección del giro entre tres puntos
		const direccion = (
			p1: PolylineResponse,
			p2: PolylineResponse,
			p3: PolylineResponse,
		): number => {
			const value =
				(p2.latitud - p1.latitud) * (p3.longitud - p2.longitud) -
				(p2.longitud - p1.longitud) * (p3.latitud - p2.latitud)

			if (value === 0) {
				return 0 // Colineales
			} else if (value < 0) {
				return 1 // Giro a la derecha
			} else {
				return 2 // Giro a la izquierda
			}
		}

		// Función para determinar si un punto está en el segmento de línea
		const enSegmento = (
			p1: PolylineResponse,
			p2: PolylineResponse,
			p3: PolylineResponse,
		): boolean => {
			return (
				Math.min(p1.latitud, p2.latitud) <= p3.latitud &&
				p3.latitud <= Math.max(p1.latitud, p2.latitud) &&
				Math.min(p1.longitud, p2.longitud) <= p3.longitud &&
				p3.longitud <= Math.max(p1.longitud, p2.longitud)
			)
		}

		// Verificar si algún segmento de polígono1 intersecta con algún segmento de polígono2
		for (let i = 0; i < poligono1.length; i++) {
			const p1 = poligono1[i]
			const p2 = poligono1[(i + 1) % poligono1.length]

			for (let j = 0; j < poligono2.length; j++) {
				const p3 = poligono2[j]
				const p4 = poligono2[(j + 1) % poligono2.length]

				if (intersectan(p1, p2, p3, p4)) {
					return true // Los polígonos se superponen
				}
			}
		}

		return false // Los polígonos no se superponen
	}

	React.useEffect(() => {
		props.setModalJoin(false)
		props.setModalFirstStep(false)
		props.setModalZonaSelected(false)
		props.setSelectedUserPoint(null)
	}, [])

	return (
		<>
			{props.isViewZonas &&
				props.zonas &&
				props.zonas.length > 0 &&
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
						onPress={() => handleZonaPress(zona)}
					/>
				))}
		</>
	)
}

type ModalZonasProps = {
	modalZonaSelected: boolean
	modalJoin: boolean
	zonaToJoin?: Zona
	isLoadingModal: boolean
	setZonaToJoin: (z: Zona) => void
	setModalJoin: (b: boolean) => void
	setModalFirstStep: (b: boolean) => void
	setModalExito: (b: boolean) => void
	setModalError: (b: boolean) => void
	handleCloseModal: () => void
	modalExito: boolean
	modalError: boolean
	modalFirstStep: boolean
	zonasSelected: Zona[]
	selectedUserPoint: number
	setSelectedUserPoint: (idx: number) => void
	navigation
}

const ModalZonas = ({
	modalZonaSelected,
	modalJoin,
	zonaToJoin,
	setZonaToJoin,
	setModalJoin,
	setModalFirstStep,
	setModalExito,
	setModalError,
	handleCloseModal,
	modalExito,
	modalError,
	modalFirstStep,
	zonasSelected,
	selectedUserPoint,
	setSelectedUserPoint,
	navigation,
}: ModalZonasProps) => {
	const [puntosConDireccion, setPuntosConDireccion] = React.useState<
		PuntoConDireccion[] | null
	>(null)
	const [isLoadingModal, setIsLoadingModal] = React.useState(false)
	const handleJoinCircuito = (zona: Zona) => {
		setDirectionPoint(zona)
		setZonaToJoin(zona)
		setModalJoin(true)
		setModalFirstStep(false)
	}

	const handleVolver = () => {
		setModalJoin(false)
		setModalFirstStep(true)
		setSelectedUserPoint(null)
	}

	const handleJoin = async (id: number, puntoReciclajeId: number) => {
		const solAgregada = await ZonasService.postJoinCircuito(
			id,
			puntoReciclajeId,
		)
		match(
			solAgregada,
			t => {
				setModalJoin(false)
				setModalExito(true)
			},
			err => {
				setModalJoin(false)
				setModalError(true)
			},
		)
	}

	const handleMisCircuitos = async () => {
		const user = await UserService.getCurrent()
		handleCloseModal()
		navigation.navigate(TabRoutes.activity, {
			screen: ActivityRoutes.listZonas,
			initial: false,
			params: {
				ciudadanoId: user.ciudadanoId,
			},
		})
	}

	const setDirectionPoint = async (zona: Zona) => {
		setIsLoadingModal(true)
		const puntosConDireccion: PuntoConDireccion[] = []

		for (const punto of zona.puntosDentroZona) {
			try {
				const locationPromise = await Location.reverseGeocodeAsync({
					latitude: punto.latitud,
					longitude: punto.longitud,
				})
				const location = await Promise.all(locationPromise)

				let address = ''
				if (location != null && location.at(0) != null) {
					address += location.at(0).name ? location.at(0).name : ''
					address += location.at(0).city ? ', ' + location.at(0).city : ''
					address += location.at(0).postalCode ? ', ' + location.at(0).postalCode : ''
					address += location.at(0).region ? ', ' + location.at(0).region : ''
				} else {
					address = 'No podemos brindar la direccion.'
				}

				const puntoConDireccion: PuntoConDireccion = {
					punto: punto,
					address: address,
				}
				puntosConDireccion.push(puntoConDireccion)
			} catch (error) {
				const address = 'No podemos brindar la dirección.'
				const puntoConDireccion: PuntoConDireccion = {
					punto: punto,
					address: address,
				}
				puntosConDireccion.push(puntoConDireccion)
			}
		}
		setPuntosConDireccion(puntosConDireccion)
		setIsLoadingModal(false)
	}

	return (
		<Modal
			isOpen={modalZonaSelected}
			onClose={() => handleCloseModal()}
			size="lg"
		>
			<Modal.Content>
				<Modal.CloseButton />
				<Modal.Header alignItems="center">
					<Text bold fontSize="xl">
						Circuitos de reciclaje
					</Text>
				</Modal.Header>
				<Modal.Body>
					{modalJoin && zonaToJoin && (
						<>
							<View>
								<Text bold fontSize="md">
									Confirma el punto que incluis al recorrido:
								</Text>
								{isLoadingModal ? (
									<Spinner
										color="emerald.800"
										accessibilityLabel="Loading posts"
									/>
								) : puntosConDireccion && puntosConDireccion.length > 0 ? (
									puntosConDireccion.map((punto, userIndex) => (
										<TouchableOpacity
											key={`user-${userIndex}`}
											onPress={() => setSelectedUserPoint(userIndex)}
										>
											<Box
												key={`box-${userIndex}`}
												mb={2}
												p={2}
												borderWidth={1}
												borderColor="gray.300"
												borderRadius="md"
												shadow={1}
												maxWidth={350}
												bg={
													selectedUserPoint === userIndex
														? 'green.100'
														: 'white'
												}
											>
												<HStack
													space={2}
													mt="0.5"
													key={`stack-${userIndex}`}
													alignItems="center"
												>
													<Text fontSize="sm">{userIndex + 1}</Text>
													<Text fontSize="sm" numberOfLines={4}>
														{punto.punto.titulo}
													</Text>
												</HStack>
												<HStack
													space={2}
													mt="0.5"
													key={`direc-${userIndex}`}
													alignItems="center"
												>
													<CircleIcon size="2" color="black" />
													<Text fontSize="sm">{punto.address}</Text>
												</HStack>
											</Box>
										</TouchableOpacity>
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
												No dispones de un punto de residuos, para solicitar
												unirte a un circuito de reciclaje primero asegura tener
												un punto de residuos creado.
											</Text>
										</View>
									</>
								)}
							</View>
						</>
					)}

					{modalExito ? (
						<>
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<CheckCircleIcon size={5} color="emerald.600" />
								<Text style={{ fontSize: 14, textAlign: 'center' }}>
									Te has unido con exito al circuito.
								</Text>
							</View>
						</>
					) : (
						modalError && (
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
										Ocurrio un error al generar la solicitud, puede que ya estes
										incluido en este circuito, verifica tus circuitos desde
										Actividad.
									</Text>
								</View>
							</>
						)
					)}

					{modalFirstStep && (
						<>
							{zonasSelected.length > 1 ? (
								<View>
									<Text bold fontSize="md">
										Parece que el circuito seleccionado se superpone con otros,
										aquí tienes todas las zonas superpuestas con la que
										elegiste.
									</Text>
								</View>
							) : null}

							{zonasSelected.length > 0 ? (
								zonasSelected.map((zona, idx) => (
									<Box
										key={`box-${idx}`}
										mb={2}
										p={2}
										borderWidth={1}
										borderColor="gray.300"
										borderRadius="md"
										shadow={1}
										maxWidth={350}
										background={'white'}
									>
										<View
											style={{
												flexDirection: 'row',
												alignItems: 'center',
												flexWrap: 'wrap',
											}}
										>
											<Text numberOfLines={15} style={{ flex: 1 }}>
												<Text style={{ fontWeight: 'bold' }}>
													Nombre del circuito:{' '}
												</Text>
												{zona.nombre}
											</Text>
										</View>
										<View>
											<Text bold fontSize="md">
												Tipos de residuo que acepta:
											</Text>
											{zona.tipoResiduo && zona.tipoResiduo.length > 0 ? (
												zona.tipoResiduo.map((tipo, index) => (
													<HStack
														space={2}
														mt="0.5"
														key={index}
														alignItems="center"
													>
														<CircleIcon size="2" color="black" />
														<Text fontSize="sm">{tipo.nombre}</Text>
													</HStack>
												))
											) : (
												<HStack space={2} mt="0.5" alignItems="center">
													<CircleIcon size="2" color="black" />
													<Text fontSize="sm">
														El circuito actualmente no acepta ningún residuo.
													</Text>
												</HStack>
											)}
										</View>
										{zona.puedeUnirse && (
											<>
												<Box mb={2} />
												<Center justifyContent="space-between">
													<Button onPress={() => handleJoinCircuito(zona)}>
														Solicitar Unirme
													</Button>
												</Center>
											</>
										)}
									</Box>
								))
							) : (
								<HStack space={2} mt="0.5" alignItems="center">
									<CircleIcon size="2" color="black" />
									<Text fontSize="sm">
										Ocurrió un error al seleccionar el circuito, reintenta más
										tarde.
									</Text>
								</HStack>
							)}
							<View
								style={{
									width: '90%',
									flexDirection: 'row',
									justifyContent: 'center',
								}}
							>
								<HStack space={2} mt="0.5" alignItems="center">
									<InfoOutlineIcon size="3" color="red.600" />
									<Text fontSize="sm" numberOfLines={4}>
										Ten en cuenta que solo puedes unirte a los circuitos que
										abarquen alguno de tus punto de residuo.
									</Text>
								</HStack>
							</View>
						</>
					)}
				</Modal.Body>
				<Modal.Footer>
					{modalJoin ? (
						<View
							style={{
								width: '100%',
								flexDirection: 'row',
								justifyContent: 'center',
							}}
						>
							<Center>
								<Button onPress={() => handleVolver()}>Volver</Button>
							</Center>
							<View style={{ marginHorizontal: 10 }} />
							{selectedUserPoint != null && (
								<Center>
									<Button
										onPress={() =>
											handleJoin(
												zonaToJoin.id,
												puntosConDireccion[selectedUserPoint].punto.id,
											)
										}
									>
										Unirme al circuito
									</Button>
								</Center>
							)}
						</View>
					) : modalExito || modalError ? (
						<>
							<View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', }} >
								<Center>
									<Button onPress={() => handleCloseModal()}>Cerrar</Button>
								</Center>
								<View style={{ marginHorizontal: 10 }} />
								<Center>
									<Button onPress={() => handleMisCircuitos()} >
										Mis Circuitos
									</Button>
								</Center>
							</View>
						</>
					) : (
						<View
							style={{
								width: '100%',
								flexDirection: 'row',
								justifyContent: 'center',
							}}
						>
							<Button onPress={() => handleCloseModal()}>Cerrar</Button>
						</View>
					)}
				</Modal.Footer>
			</Modal.Content>
		</Modal>
	)
}

type PuntoReciclajeModalProps = {
	show: boolean
	onClose: () => void
	point: PuntoReciclaje
	isLoadingModal
	direction
	getDirection
	navigation
	crearResiduo
}

const PuntoReciclajeModal = (props: PuntoReciclajeModalProps) => {
	if (!props.show) return <></>
	const toast = useToast()
	const [modalEntregar, setModalEntregar] = React.useState(false)
	const [userResiduos, setUserResiduos] = React.useState<ResiduoResponse[]>([])
	const [selectedResiduos, setSelectedResiduos] = React.useState<number[]>([])
	const [retiroExitoso, setRetiroExitoso] = React.useState(false)
	const [errorRetiro, setErrorRetiro] = React.useState(false)
	const [errorMsj, setErrorMsj] = React.useState<string | null>(null)
	const [successMsj, setSuccessMsj] = React.useState<string | null>(null)

	const handleEntregarResiduos = async residuos => {
		const residuosPuntoActual = residuos.map(tipo => tipo.id)
		const residuosPuntoActualToString: string[] = residuosPuntoActual.map(
			numero => numero.toString(),
		)
		const user = await UserService.getCurrent()
		if (user) {
			const getUserResiduos = await ResiduoService.getAll({
				ciudadanos: [user.ciudadanoId.toString()],
				tipos: residuosPuntoActualToString,
				retirado: false,
				fechaLimiteRetiro: new Date().toISOString(),
			})

			ifLeft(getUserResiduos, t => {
				setUserResiduos(t)
			})
			ifRight(getUserResiduos, t => {
				setUserResiduos([])
			})

			setModalEntregar(true)
		}
	}

	const formatFecha = fecha => {
		try {
			if (fecha != null) {
				const dia = fecha.substring(8, 10)
				const mes = fecha.substring(5, 7)
				const anio = fecha.substring(0, 4)
				return `Fecha limite para el dia ${dia}/${mes}/${anio}`
			}
			return 'Sin fecha limite'
		} catch (error) {
			return 'Sin fecha limite'
		}
	}

	const handleBoxPress = (index: number) => {
		if (selectedResiduos.includes(index)) {
			setSelectedResiduos(prevState => prevState.filter(i => i !== index))
		} else {
			setSelectedResiduos(prevState => [...prevState, index])
		}
	}

	const handleCreateResiduo = () => {
		props.crearResiduo()
		props.onClose()
	}

	const handleRealizarSolicitud = async () => {
		const residuosSeleccionados = selectedResiduos.map(
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
						successMap.push(residuo.tipoResiduo.nombre)
					}
				})
			})
			ifRight(result, t => {
				userResiduos.forEach(residuo => {
					if (r.id == residuo.id) {
						errorMap.push(residuo.tipoResiduo.nombre)
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
	}

	const handleMisSolicitudes = async () => {
		const user = await UserService.getCurrent()
		props.onClose()
		props.navigation.navigate(TabRoutes.activity, {
			screen: ActivityRoutes.listSolicitudes,
			initial: false,
			params: {
				ciudadanoId: user.ciudadanoId,
			},
		})
	}

	const handleContactar = async (point: PuntoVerde) => {
		const email = point.email
		const subject = 'Contacto para reciclar a traves de Circle8'
		const body = `¡Hola  ${point.titulo}! me gustaria recibir informacion para poder reciclar con ustedes.`

		const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
			subject,
		)}&body=${encodeURIComponent(body)}`

		Linking.openURL(mailtoUrl).catch(error => {
			toast.show({
				description:
					'Ocurrio un error al generar el mail, reintenta mas tarde.',
			})
		})
	}

	React.useEffect(() => {
		if (props.point) {
			props.getDirection(props.point.latitud, props.point.longitud)
		}
	}, [])

	return (
		<Modal isOpen={props.show} onClose={props.onClose} size="lg">
			<Modal.Content>
				<Modal.CloseButton />
				<Modal.Header alignItems="center">
					<Text bold fontSize="xl">
						{props.point.titulo}
					</Text>
				</Modal.Header>
				<Modal.Body>
					{props.isLoadingModal ? (
						<Spinner color="emerald.800" accessibilityLabel="Loading posts" />
					) : retiroExitoso ? (
						<>
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<CheckCircleIcon size={5} color="emerald.600" />
								<Text style={{ fontSize: 14, textAlign: 'center' }}>
									¡Orden de entrega creada con éxito!
								</Text>
							</View>
						</>
					) : errorRetiro ? (
						<>
							{successMsj !== null ? (
								<View
									style={{
										flex: 1,
										justifyContent: 'center',
										alignItems: 'center',
										marginBottom: 20,
									}}
								>
									<CheckCircleIcon size={5} color="emerald.600" />
									<Text style={{ fontSize: 14, textAlign: 'center' }}>
										{successMsj}
									</Text>
								</View>
							) : (
								''
							)}
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									marginBottom: 20,
								}}
							>
								<WarningOutlineIcon size={5} color="red.600" />
								<Text style={{ fontSize: 14, textAlign: 'center' }}>
									{errorMsj}
								</Text>
							</View>
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									marginBottom: 20,
								}}
							>
								<InfoOutlineIcon size={5} color="emerald.600" />
								<Text style={{ fontSize: 14, textAlign: 'center' }}>
									Asegurate que no hayas generado anteriormente esta solicitud,
									podes verlo desde tus solicitudes.
								</Text>
							</View>
						</>
					) : modalEntregar ? (
						<>
							<View>
								<Text bold fontSize="md">
									Selecciona los residuos que queres entregar:
								</Text>
								{userResiduos && userResiduos.length > 0 ? (
									userResiduos.map((userResiduo, index) => (
										<TouchableOpacity
											key={`resUser-${index}`}
											onPress={() => handleBoxPress(index)}
										>
											<Box
												key={`resBox-${index}`}
												mb={2}
												p={2}
												borderWidth={1}
												borderColor="gray.300"
												borderRadius="md"
												shadow={1}
												maxWidth={350}
												bg={
													selectedResiduos.includes(index)
														? 'green.100'
														: 'white'
												}
											>
												<HStack
													space={2}
													mt="0.5"
													key={`name-${index}`}
													alignItems="center"
												>
													<Text fontSize="sm">{index + 1}</Text>
													<Text fontSize="sm">
														{userResiduo.tipoResiduo.nombre}
													</Text>
												</HStack>
												<HStack
													space={2}
													mt="0.5"
													key={`desc-${index}`}
													alignItems="center"
												>
													<InfoOutlineIcon size="3" color="emerald.600" />
													<Text fontSize="sm" numberOfLines={24} style={{ flex: 1 }}>
														{userResiduo.descripcion}
													</Text>
												</HStack>
												<HStack
													space={2}
													mt="0.5"
													key={`date-${index}`}
													alignItems="center"
												>
													<WarningOutlineIcon size="3" color="emerald.600" />
													<Text fontSize="sm">
														{formatFecha(userResiduo.fechaLimiteRetiro)}
													</Text>
												</HStack>
											</Box>
										</TouchableOpacity>
									))
								) : (
									<HStack space={2} mt="0.5" alignItems="center">
										<WarningOutlineIcon size="3" color="emerald.600" />
										<Text fontSize="sm">
											No dispones de residuos que acepte este punto de
											reciclaje, si olvidaste crearlo, podes hacerlo en este
											momento.
										</Text>
									</HStack>
								)}
							</View>
						</>
					) : (
						<>
							<View>
								<Text bold fontSize="md">
									Días en que se puede depositar:
								</Text>
								<Text>{props.point.dias.map(mapDays).join(' - ')}</Text>
							</View>
							<View>
								<Text bold fontSize="md">
									Tipos de residuo que acepta:
								</Text>
								{props.point.tipoResiduo &&
								props.point.tipoResiduo.length > 0 ? (
									props.point.tipoResiduo.map((tipo, index) => (
										<HStack space={2} mt="0.5" key={index} alignItems="center">
											<CircleIcon size="2" color="black" />
											<Text fontSize="sm">{tipo.nombre}</Text>
										</HStack>
									))
								) : (
									<HStack space={2} mt="0.5" alignItems="center">
										<CircleIcon size="2" color="black" />
										<Text fontSize="sm">
											El punto actualmente no acepta ningun residuo.
										</Text>
									</HStack>
								)}
							</View>
							<View>
								<Text bold fontSize="md">
									Direccion:
								</Text>
								<Text>{props.direction}</Text>
							</View>
						</>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Center flex={1}>
						{retiroExitoso || errorRetiro ? (
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
								}}
							>
								<Button onPress={props.onClose}>Cerrar</Button>
								<View style={{ marginHorizontal: 10 }} />
								<Button onPress={handleMisSolicitudes}>
									Ir a mis solicitudes
								</Button>
							</View>
						) : props.point.tipo !== 'RECICLAJE' ? (
							<Button onPress={() => handleContactar(props.point)}>Contactar</Button>
						) : modalEntregar && userResiduos.length <= 0 ? (
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
								}}
							>
								<Button onPress={props.onClose}>Cerrar</Button>
								<View style={{ marginHorizontal: 10 }} />
								<Button onPress={handleCreateResiduo}>Crear Residuo</Button>
							</View>
						) : modalEntregar && userResiduos.length >= 0 && selectedResiduos.length != 0 ? (
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
								}}
							>
								<Button onPress={() => setModalEntregar(false)}>Volver</Button>
								<View style={{ marginHorizontal: 10 }} />
								<Button onPress={handleRealizarSolicitud}>
									Entregar Residuos
								</Button>
							</View>
						) :  modalEntregar && userResiduos.length >= 0 && selectedResiduos.length == 0 ? (
							<Button onPress={() => setModalEntregar(false)}>Volver</Button>
						) : props.point.tipoResiduo &&
						  props.point.tipoResiduo.length > 0 ? (
							<Button
								onPress={() => handleEntregarResiduos(props.point.tipoResiduo)}
							>
								Quiero Entregar Residuos
							</Button>
						) : (
							<Button onPress={props.onClose}>Cerrar</Button>
						)}
					</Center>
				</Modal.Footer>
			</Modal.Content>
		</Modal>
	)
}

type PuntoResiduoModalProps = {
	show: boolean
	onClose: () => void
	point: PuntoResiduo
	isLoadingModal
	direction
	getDirection
	getPuntoResiduo
	navigation
}

const PuntoResiduoModal = (props: PuntoResiduoModalProps) => {
	if (!props.show) return <></>

	const [selectedResiduos, setSelectedResiduos] = React.useState<number[]>([])
	const [retiroExitoso, setRetiroExitoso] = React.useState(false)
	const [errorRetiro, setErrorRetiro] = React.useState(false)
	const [firstStep, setFirstStep] = React.useState(true)
	const [userPoints, setUserPoints] = React.useState<Punto[]>([])
	const [selectedUserPoint, setSelectedUserPoint] = React.useState<
		number | null
	>(null)
	const [errorMsj, setErrorMsj] = React.useState<string | null>(null)
	const [successMsj, setSuccessMsj] = React.useState<string | null>(null)

	React.useEffect(() => {
		if (props.point) {
			props.getDirection(props.point.latitud, props.point.longitud)
			props.getPuntoResiduo(props.point.id, props.point.ciudadanoId)
		}
	}, [])

	const handleBoxPress = (index: number) => {
		if (selectedResiduos.includes(index)) {
			setSelectedResiduos(prevState => prevState.filter(i => i !== index))
		} else {
			setSelectedResiduos(prevState => [...prevState, index])
		}
	}

	const handleRetirarClick = async () => {
		const puntosSeleccionados = selectedResiduos.map(
			index => props.point.residuos[index],
		)

		const puntoReciclajeId = userPoints[selectedUserPoint]
		const errorMap: string[] = []
		const successMap: string[] = []
		for (const p of puntosSeleccionados) {
			const result = await PuntoService.postRetiroResiudo(
				p.id,
				puntoReciclajeId.id,
			)
			ifLeft(result, t => {
				successMap.push(p.tipoResiduo.nombre)
			})
			ifRight(result, t => {
				errorMap.push(p.tipoResiduo.nombre)
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
	}

	const handleUserPointSelection = async () => {
		const puntosSeleccionados = selectedResiduos.map(
			i => props.point.residuos[i].tipoResiduo.id,
		)
		const puntosSeleccionadosStrings: string[] = puntosSeleccionados.map(
			numero => numero.toString(),
		)
		const user = await UserService.getCurrent()
		if (user) {
			const getUserPoints = await PuntoService.getAll({
				recicladorId: user.ciudadanoId,
				tipos: ['RECICLAJE'],
				residuos: puntosSeleccionadosStrings,
			})
			setUserPoints(getUserPoints)
			setFirstStep(false)
		}
	}

	const handleResetClick = () => {
		props.onClose()
	}

	const handleVolverClick = () => {
		setFirstStep(true)
	}

	const handleCreatePuntoReciclaje = async () => {
		const user = await UserService.getCurrent()
		props.onClose()
		props.navigation.navigate('ProfileTab', {
			screen: 'EditPuntoReciclaje',
			initial: false,
			params: {
				recicladorId: user.ciudadanoId
			}
		})
	}

	const handleMisSolicitudes = async () => {
		const user = await UserService.getCurrent()
		props.onClose()
		props.navigation.navigate(TabRoutes.activity, {
			screen: ActivityRoutes.listSolicitudes,
			initial: false,
			params: {
				ciudadanoId: user.ciudadanoId,
			},
		})
	}

	const formatFecha = fecha => {
		try {
			if (fecha != null) {
				const dia = fecha.substring(8, 10)
				const mes = fecha.substring(5, 7)
				const anio = fecha.substring(0, 4)
				return `Deben retirarse antes del ${dia}/${mes}/${anio}`
			}
			return 'Sin fecha limite de retiro'
		} catch (error) {
			return 'Sin fecha limite de retiro'
		}
	}

	return (
		<Modal isOpen={props.show} onClose={props.onClose} size="lg">
			<Modal.Content>
				<Modal.CloseButton />
				<Modal.Header alignItems="center">
					<Text bold fontSize="xl">
						{props.point.titulo}
					</Text>
				</Modal.Header>
				<Modal.Body>
					{props.isLoadingModal ? (
						<Spinner color="emerald.800" accessibilityLabel="Loading posts" />
					) : retiroExitoso ? (
						<>
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<CheckCircleIcon size={5} color="emerald.600" />
								<Text style={{ fontSize: 14, textAlign: 'center' }}>
									¡Orden de retiro creada con éxito!
								</Text>
							</View>
						</>
					) : errorRetiro ? (
						<>
							{successMsj !== null ? (
								<View
									style={{
										flex: 1,
										justifyContent: 'center',
										alignItems: 'center',
										marginBottom: 20,
									}}
								>
									<CheckCircleIcon size={5} color="emerald.600" />
									<Text style={{ fontSize: 14, textAlign: 'center' }}>
										{successMsj}
									</Text>
								</View>
							) : (
								''
							)}
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									marginBottom: 20,
								}}
							>
								<WarningOutlineIcon size={5} color="red.600" />
								<Text style={{ fontSize: 14, textAlign: 'center' }}>
									{errorMsj}
								</Text>
							</View>
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									marginBottom: 20,
								}}
							>
								<InfoOutlineIcon size={5} color="emerald.600" />
								<Text style={{ fontSize: 14, textAlign: 'center' }}>
									Asegurate que el punto de reciclaje elegido admita el tipo de
									residuo que queres retirar y que no hayas solicitado este
									residuo anteriormente.
								</Text>
							</View>
						</>
					) : firstStep ? (
						<>
							<View>
								<Text bold fontSize="md">
									Selecciona los residuos a retirar:
								</Text>
								{props.point.residuos && props.point.residuos.length > 0 ? (
									props.point.residuos.map((tipo, index) => (
										<TouchableOpacity
											key={`resUser-${index}`}
											onPress={() => handleBoxPress(index)}
										>
											<Box
												key={`resBox-${index}`}
												mb={2}
												p={2}
												borderWidth={1}
												borderColor="gray.300"
												borderRadius="md"
												shadow={1}
												maxWidth={350}
												bg={
													selectedResiduos.includes(index)
														? 'green.100'
														: 'white'
												}
											>
												<HStack
													space={2}
													mt="0.5"
													key={`name-${index}`}
													alignItems="center"
												>
													<Text fontSize="sm">{index + 1}</Text>
													<Text fontSize="sm">{tipo.tipoResiduo.nombre}</Text>
												</HStack>
												<HStack
													space={2}
													mt="0.5"
													key={`desc-${index}`}
													alignItems="center"
												>
													<InfoOutlineIcon size="3" color="emerald.600" />
													<Text fontSize="sm" numberOfLines={24} style={{ flex: 1 }}>
														{tipo.descripcion}
													</Text>
												</HStack>
												<HStack
													space={2}
													mt="0.5"
													key={`date-${index}`}
													alignItems="center"
												>
													<WarningOutlineIcon size="3" color="emerald.600" />
													<Text fontSize="sm">
														{formatFecha(tipo.fechaLimiteRetiro)}
													</Text>
												</HStack>
											</Box>
										</TouchableOpacity>
									))
								) : (
									<Text fontSize="sm">
										No hay información de los tipos de residuo para que puedas retirar.
									</Text>
								)}
							</View>
							<View>
								<Text bold fontSize="md">
									Direccion:
								</Text>
								<Text>{props.direction}</Text>
							</View>
						</>
					) : (
						<>
							<View>
								<Text bold fontSize="md">
									Selecciona el punto donde lo queres recibir:
								</Text>
								{userPoints && userPoints.length > 0 ? (
									userPoints.map((punto, userIndex) => (
										<TouchableOpacity
											key={`user-${userIndex}`}
											onPress={() => setSelectedUserPoint(userIndex)}
										>
											<Box
												key={`box-${userIndex}`}
												mb={2}
												p={2}
												borderWidth={1}
												borderColor="gray.300"
												borderRadius="md"
												shadow={1}
												maxWidth={350}
												bg={
													selectedUserPoint === userIndex
														? 'green.100'
														: 'white'
												}
											>
												<HStack
													space={2}
													mt="0.5"
													key={`stack-${userIndex}`}
													alignItems="center"
												>
													<Text fontSize="sm">{userIndex + 1}</Text>
													<Text fontSize="sm" numberOfLines={4}>
														{punto.titulo}
													</Text>
												</HStack>
											</Box>
										</TouchableOpacity>
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
												No dispones de un punto de reciclaje, para generar un
												orden de retiro primero asegura tener un punto de
												reciclaje creado.
											</Text>
										</View>
									</>
								)}
							</View>
						</>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Center flex={1}>
						{retiroExitoso || errorRetiro ? (
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
								}}
							>
								<Button onPress={handleResetClick}>Cerrar</Button>
								<View style={{ marginHorizontal: 10 }} />
								<Button onPress={handleMisSolicitudes}>
									Ir a mis solicitudes
								</Button>
							</View>
						) : firstStep && selectedResiduos.length != 0 ? (
							<Button onPress={handleUserPointSelection}>Siguiente</Button>
						) : !firstStep && userPoints.length === 0 ? (
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
								}}
							>
								<Button onPress={handleResetClick}>Cerrar</Button>
								<View style={{ marginHorizontal: 10 }} />
								<Button onPress={handleCreatePuntoReciclaje}>
									Crear punto
								</Button>
							</View>
						) : selectedResiduos.length != 0 ? (
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
								}}
							>
								<Button onPress={handleVolverClick}>Volver</Button>
								<View style={{ marginHorizontal: 10 }} />
								<Button onPress={handleRetirarClick}>Retirar</Button>
							</View>
						) : (
							<Button onPress={handleResetClick}>Cerrar</Button>
						)}
					</Center>
				</Modal.Footer>
			</Modal.Content>
		</Modal>
	)
}

const FiltrosModal = ({
	isOpen,
	onClose,
	handleFiltroPress,
	showCheckboxesPuntos,
	showCheckboxesTipos,
	showCheckboxesDias,
	selectedPuntos,
	setSelectedPuntos,
	selectedTipos,
	setSelectedTipos,
	selectedDias,
	setSelectedDias,
	getPoints,
	tipos,
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<Modal.Content>
				<Modal.CloseButton />
				<Modal.Header>Filtrar por</Modal.Header>
				<Modal.Body>
					<TouchableOpacity onPress={() => handleFiltroPress('Puntos')}>
						<HStack
							space={2}
							justifyContent="space-between"
							alignItems="center"
						>
							<Text color="black" fontSize="md" bold>
								Tipos de Puntos
							</Text>
							{showCheckboxesPuntos ? (
								<ChevronUpIcon size="5" mt="0.5" color="emerald.500" />
							) : (
								<ChevronDownIcon size="5" mt="0.5" color="emerald.500" />
							)}
						</HStack>
					</TouchableOpacity>
					{showCheckboxesPuntos && (
						<Checkbox.Group
							colorScheme="green"
							defaultValue={selectedPuntos}
							accessibilityLabel="Selecciona los puntos que quieres ver"
							onChange={values => setSelectedPuntos(values || [])}
						>
							<Checkbox value="VERDE" my={2}>
								Reciclaje comunitario
							</Checkbox>
							<Checkbox value="RECICLAJE" my={2}>
								Reciclaje particular
							</Checkbox>
							<Checkbox value="RESIDUO" my={2}>
								Retiro de residuos
							</Checkbox>
						</Checkbox.Group>
					)}
					<TouchableOpacity onPress={() => handleFiltroPress('Tipos')}>
						<HStack
							space={2}
							justifyContent="space-between"
							alignItems="center"
						>
							<Text color="black" fontSize="md" bold>
								Tipos de Residuo
							</Text>
							{showCheckboxesTipos ? (
								<ChevronUpIcon size="5" mt="0.5" color="emerald.500" />
							) : (
								<ChevronDownIcon size="5" mt="0.5" color="emerald.500" />
							)}
						</HStack>
					</TouchableOpacity>
					{showCheckboxesTipos && (
						<Checkbox.Group
							colorScheme="green"
							defaultValue={selectedTipos}
							accessibilityLabel="Selecciona los tipos de residuo que quieres ver"
							onChange={values => setSelectedTipos(values || [])}
						>
							{tipos && tipos.length > 0 ? (
								tipos.map(tipo => (
									<Checkbox value={tipo.id} my={2}>
										{tipo.nombre}
									</Checkbox>
								))
							) : (
								<Text fontSize="sm">
									No hay información de los tipos de residuo.
								</Text>
							)}
						</Checkbox.Group>
					)}
					<TouchableOpacity onPress={() => handleFiltroPress('Dias')}>
						<HStack
							space={2}
							justifyContent="space-between"
							alignItems="center"
						>
							<Text color="black" fontSize="md" bold>
								Dias
							</Text>
							{showCheckboxesDias ? (
								<ChevronUpIcon size="5" mt="0.5" color="emerald.500" />
							) : (
								<ChevronDownIcon size="5" mt="0.5" color="emerald.500" />
							)}
						</HStack>
					</TouchableOpacity>
					{showCheckboxesDias && (
						<Checkbox.Group
							colorScheme="green"
							defaultValue={selectedDias}
							accessibilityLabel="Selecciona los dias que abren los puntos"
							onChange={values => setSelectedDias(values || [])}
						>
							<Checkbox value="0" my={2}>
								Lunes
							</Checkbox>
							<Checkbox value="1" my={2}>
								Martes
							</Checkbox>
							<Checkbox value="2" my={2}>
								Miercoles
							</Checkbox>
							<Checkbox value="3" my={2}>
								Jueves
							</Checkbox>
							<Checkbox value="4" my={2}>
								Viernes
							</Checkbox>
							<Checkbox value="5" my={2}>
								Sabado
							</Checkbox>
							<Checkbox value="6" my={2}>
								Domingo
							</Checkbox>
						</Checkbox.Group>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Center flex={1}>
						<Button
							onPress={() => {
								getPoints()
								onClose()
							}}
						>
							Filtrar
						</Button>
					</Center>
				</Modal.Footer>
			</Modal.Content>
		</Modal>
	)
}
