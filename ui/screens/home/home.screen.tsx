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
} from 'native-base'
import Ionicons from '@expo/vector-icons/Ionicons'
import { FontAwesome } from '@expo/vector-icons'
import { colors } from '../../../constants/styles'
import * as Location from 'expo-location'
import { LoadingScreen } from '../../components/loading.component'
import { PuntoServicio } from '../../../services/punto.service'
import { Punto, TipoPunto } from '../../../services/types'
import { SafeAreaView } from 'react-native-safe-area-context'

type Coord = {
	latitude: number
	longitude: number
}

const latitudeDelta = 0.01
const longitudeDelta = 0.01

export const Home = () => {
	const [isLoading, setLoading] = React.useState(true)
	const [userCoords, setUserCoords] = React.useState<Coord>()
	const [points, setPoints] = React.useState<Punto[]>([])
	const [isFilterOpen, setFilterIsOpen] = React.useState(false)
	const [selectedValues, setSelectedValues] = React.useState<TipoPunto[]>([
		'VERDE',
		'RECICLAJE'
	])

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

	const getPoints = async () => {
		const newPoints = await PuntoServicio.getAll(selectedValues)
		setPoints(newPoints)
	}

	const handleFilterPress = () => {
		setFilterIsOpen(!isFilterOpen)
	}

	const closePopover = () => {
		setFilterIsOpen(false)
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
							/>
						))}
					</MapView>
				</Box>
				<Box position="absolute" top={10} left={0} p={4}>
					<Filter onPress={handleFilterPress}/>
				</Box>
				<Modal isOpen={isFilterOpen} onClose={closePopover}>
					<Modal.Content>
						<Modal.CloseButton />
						<Modal.Header>Selecciona que ver en el mapa</Modal.Header>
						<Modal.Body>
							<Checkbox.Group
								colorScheme="green"
								defaultValue={selectedValues}
								accessibilityLabel="Selecciona los puntos que quieres ver"
								onChange={values => setSelectedValues(values || [])}
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
						</Modal.Body>
						<Modal.Footer>
							<Center flex={1}>
								<Button
									onPress={() => {
										getPoints()
										closePopover()
									}}
								>
									Filtrar
								</Button>
							</Center>
						</Modal.Footer>
					</Modal.Content>
				</Modal>
				<Center height="15%" bgColor="white">
					<Row alignContent="center" mt="4">
						<Center w="33%">
							<FontAwesome name="recycle" size={40} color={colors.primary800} />
							<Text fontSize="xs">Retirar residuos</Text>
						</Center>
						<Center w="33%">
							<Ionicons name="trash" size={40} color={colors.primary800} />
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
			<Center
				width={60}
				height={60}
				bg={colors.primary800}
				rounded="full"
			>
				<FontAwesome name="filter" size={40} color={colors.primary100} />
			</Center>
		</TouchableOpacity>
	)
}
