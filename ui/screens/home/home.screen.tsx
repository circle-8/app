import React from 'react'
import { GestureResponderEvent, TouchableOpacity } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
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
	VStack,
	InfoOutlineIcon,
	WarningIcon,
	WarningOutlineIcon,
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
	TipoPunto,
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
import { match } from '../../../utils/either'

type Coord = {
	latitude: number
	longitude: number
}

const latitudeDelta = 0.01
const longitudeDelta = 0.01

type Props = NativeStackScreenProps<MainRoutesParams, 'Home'>

export const Home = ({ navigation }: Props) => {
	const [isLoading, setLoading] = React.useState(true)
	const [userCoords, setUserCoords] = React.useState<Coord>()
	const [points, setPoints] = React.useState<Punto[]>([])
	const [isFilterOpen, setFilterIsOpen] = React.useState(false)
	const [selectedPuntos, setSelectedPuntos] = React.useState<TipoPunto[]>([
		'VERDE',
		'RECICLAJE',
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

	const obtenerPuntoResiduoAsync = async (id, ciudadanoId) => {
		try {
			const p = await PuntoService.getPuntoResiduo(id, ciudadanoId)
			match(
				p,
				punto => {
					setPuntoResiduo(punto)
				},
				err => {
					console.error('Error al obtener el punto de residuo:', err)
				},
			)
		} catch (error) {
			console.error('Error al obtener el punto de residuo:', error)
		}
	}

	const getPoints = async () => {
		const newPoints = await PuntoService.getAll({
			tipos: selectedPuntos,
			residuos: selectedTipos,
			dias: selectedDias,
		})
		setPoints(newPoints)
	}

	const getDirection = async (latitude, longitude) => {
		try {
			setIsLoadingModal(true)
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

	/* Initial data loading */
	React.useEffect(() => {
		getUserLocation()
		getPoints()
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
				<Box height="85%">
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
					>
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
				/>
				<PuntoReciclajeModal
					show={!!puntoReciclaje}
					onClose={() => setPuntoReciclaje(undefined)}
					point={puntoReciclaje}
					isLoadingModal={isLoadingModal}
					direction={direction}
					getDirection={getDirection}
				/>
				<PuntoResiduoModal
					show={!!puntoResiduo}
					onClose={() => setPuntoResiduo(undefined)}
					point={puntoResiduo}
					isLoadingModal={isLoadingModal}
					direction={direction}
					getDirection={getDirection}
					obtenerPuntoResiduoAsync={obtenerPuntoResiduoAsync}
				/>
				<Center height="15%" bgColor="white">
					<Row alignContent="center" mt="4">
						<Center w="33%">
							<TouchableOpacity
								onPress={() =>
									navigation.navigate('ProfileTab', {
										screen: 'ListPuntoReciclaje',
										initial: false,
									})
								}
							>
								<FontAwesome
									name="recycle"
									size={40}
									color={colors.primary800}
								/>
							</TouchableOpacity>
							<Text fontSize="xs">Retirar residuos</Text>
						</Center>
						<Center w="33%">
							<TouchableOpacity
								onPress={async () => {
									// Traer puntos de residuos del user
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
								}}
							>
								<Ionicons name="trash" size={40} color={colors.primary800} />
							</TouchableOpacity>
							<Text fontSize="xs">Entregar residuos</Text>
						</Center>
						<Center w="33%">
							<Ionicons name="leaf" size={40} color={colors.primary800} />
							<Text fontSize="xs">Circuitos de Reciclaje</Text>
						</Center>
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

type PuntoReciclajeModalProps = {
	show: boolean
	onClose: () => void
	point: PuntoReciclaje
	isLoadingModal
	direction
	getDirection
}

const PuntoReciclajeModal = (props: PuntoReciclajeModalProps) => {
	if (!props.show) return <></>

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
								{props.point.tipoResiduo.map((tipo, index) => (
									<HStack space={2} mt="0.5" key={index} alignItems="center">
										<CircleIcon size="2" color="black" />
										<Text fontSize="sm">{tipo.nombre}</Text>
									</HStack>
								))}
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
						<Button>Contactar</Button>
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
	obtenerPuntoResiduoAsync
}

const PuntoResiduoModal = (props: PuntoResiduoModalProps) => {
	if (!props.show) return <></>

	const [selectedBoxIndices, setSelectedBoxIndices] = React.useState<number[]>(
		[],
	)
	const [retiroExitoso, setRetiroExitoso] = React.useState(false)

	React.useEffect(() => {
		if (props.point) {
			props.getDirection(props.point.latitud, props.point.longitud)
			props.obtenerPuntoResiduoAsync(props.point.id, props.point.ciudadanoId)
		}
	}, [])

	const handleBoxPress = (index: number) => {
		if (selectedBoxIndices.includes(index)) {
			setSelectedBoxIndices(prevState => prevState.filter(i => i !== index))
		} else {
			setSelectedBoxIndices(prevState => [...prevState, index])
		}
	}

	const handleRetirarClick = async () => {
		const puntosSeleccionados = selectedBoxIndices.map(
			index => props.point.residuos[index].id,
		)

		//await PuntoService.getPuntoResiduo(puntosSeleccionados)
		for (const puntoId of puntosSeleccionados) {
			const result = await PuntoService.postRetiroResiudo(puntoId, props.point.id);
		
			if (result) {
			  console.log(`Se realizó la solicitud de retiro para el punto con ID ${puntoId}`);
			  // Realizar otras acciones si es necesario
			} else {
			  console.error(`No se pudo realizar la solicitud de retiro para el punto con ID ${puntoId}`);
			  // Realizar otras acciones si es necesario
			}
		  }
		console.log(puntosSeleccionados)
		setRetiroExitoso(true)
	}

	const handleResetClick = () => {
		setRetiroExitoso(false)
		setSelectedBoxIndices([])
		props.onClose();
	}

	const formatFecha = fecha => {
		try {
			const dia = fecha.substring(8, 10)
			const mes = fecha.substring(5, 7)
			const anio = fecha.substring(0, 4)
			return `Deben retirarse antes del ${dia}/${mes}/${anio}`
		} catch (error) {
			console.error('Error al formatear la fecha:', error)
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
							<HStack space={2} mt="0.5" alignItems="center">
								<Text fontSize="md">¡Orden de retiro creada con éxito!</Text>
							</HStack>
						</>
					) : (
						<>
							<View>
								<Text bold fontSize="md">
									Selecciona los residuos a retirar:
								</Text>
								{props.point.residuos && props.point.residuos.length > 0 ? (
									props.point.residuos.map((tipo, index) => (
										<TouchableOpacity
											key={index}
											onPress={() => handleBoxPress(index)}
										>
											<Box
												key={index}
												mb={2}
												p={2}
												borderWidth={1}
												borderColor="gray.300"
												borderRadius="md"
												shadow={1}
												bg={
													selectedBoxIndices.includes(index)
														? 'green.100'
														: 'white'
												}
											>
												<HStack
													space={2}
													mt="0.5"
													key={index}
													alignItems="center"
												>
													<Text fontSize="sm">{index + 1}</Text>
													<Text fontSize="sm">{tipo.tipoResiduo.nombre}</Text>
												</HStack>
												<HStack
													space={2}
													mt="0.5"
													key={index}
													alignItems="center"
												>
													<InfoOutlineIcon size="3" color="emerald.600" />
													<Text fontSize="sm">{tipo.descripcion}</Text>
												</HStack>
												<HStack
													space={2}
													mt="0.5"
													key={index}
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
										No hay información de los tipos de residuo que para retirar.
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
					)}
				</Modal.Body>
				<Modal.Footer>
					<Center flex={1}>
						{retiroExitoso ? (
							<Button onPress={handleResetClick}>Cerrar</Button>
						) : (
							<Button onPress={handleRetirarClick}>Retirar</Button>
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
								Puntos de reciclaje comunitario
							</Checkbox>
							<Checkbox value="RECICLAJE" my={2}>
								Puntos de reciclaje particular
							</Checkbox>
							<Checkbox value="RESIDUO" my={2}>
								Punto de retiro de residuos
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
							<Checkbox value="Plástico" my={2}>
								Plastico
							</Checkbox>
							<Checkbox value="Papel" my={2}>
								Papel
							</Checkbox>
							<Checkbox value="Pilas" my={2}>
								Pilas
							</Checkbox>
							<Checkbox value="Carton" my={2}>
								Carton
							</Checkbox>
							<Checkbox value="Organicos" my={2}>
								Organicos
							</Checkbox>
							<Checkbox value="Compost" my={2}>
								Compost
							</Checkbox>
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
