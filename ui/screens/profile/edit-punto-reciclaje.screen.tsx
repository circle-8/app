import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
	Box,
	Button,
	Center,
	Checkbox,
	FormControl,
	HStack,
	Heading,
	Input,
	ScrollView,
	VStack,
	useToast,
} from 'native-base'
import React from 'react'
import { ProfileRoutesParams } from '../../../constants/routes'
import { Dia, PuntoReciclaje, TipoResiduo } from '../../../services/types'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import { LoadingScreen } from '../../components/loading.component'
import { PuntoService } from '../../../services/punto.service'
import { match } from '../../../utils/either'
import { colors } from '../../../constants/styles'
import { TipoResiduoService } from '../../../services/tipos.service'
import { Platform } from 'react-native'

type Props = NativeStackScreenProps<ProfileRoutesParams, 'EditPuntoReciclaje'>

type Coord = {
	latitude: number
	longitude: number
}

export const EditPuntoReciclaje = ({ navigation, route }: Props) => {
	const [initialMarkerCoord, setInitialMarkerCoord] = React.useState<Coord>()
	const [isLoading, setLoading] = React.useState(true)
	const [punto, setPunto] = React.useState<PuntoReciclaje>()
	const [tipos, setTipos] = React.useState<TipoResiduo[]>()
	const toast = useToast()

	const id = route.params?.puntoReciclajeId
	const recicladorId = route.params?.recicladorId

	const getUserLocation = async () => {
		return await Location.getCurrentPositionAsync()
	}

	const loadInitialData = async () => {
		const tipos = await TipoResiduoService.getAll()
		match(
			tipos,
			t => setTipos(t),
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)
		if (id) {
			// Es pantalla de edicion
			const p = await PuntoService.getPuntoReciclaje(id, recicladorId)
			match(
				p,
				punto => {
					setPunto(punto)
					setInitialMarkerCoord({
						latitude: punto.latitud,
						longitude: punto.longitud,
					})
					setLoading(false)
				},
				err => {
					toast.show({ description: err })
					navigation.goBack()
				},
			)
		} else {
			// Es pantalla de nuevo punto
			const p = await getUserLocation()
			setInitialMarkerCoord({
				latitude: p.coords.latitude,
				longitude: p.coords.longitude,
			})
			setLoading(false)
		}
	}

	React.useEffect(() => {
		loadInitialData()
	}, [])

	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<ScrollView>
			<Center w="100%">
				<Box safeArea p="2" w="90%" maxW="320">
					<Form
						id={id}
						punto={punto}
						tipos={tipos}
						initialPosition={initialMarkerCoord}
						onSubmit={async (formData, tipos, dias) => {
							const savedPunto = await PuntoService.savePuntoReciclaje({
								id,
								recicladorId,
								titulo: formData.titulo,
								tiposResiduo: tipos,
								dias: dias,
								latitud: formData.punto.latitude,
								longitud: formData.punto.longitude,
							})
							match(
								savedPunto,
								p => {
									toast.show({description: 'Punto guardado exitosamente'})
									navigation.goBack()
								},
								err => {
									toast.show({description: err})
									navigation.goBack()
								}
							)
						}}
					/>
				</Box>
			</Center>
		</ScrollView>
	)
}

type FormState = {
	titulo: string
	punto: Coord
}
const defaultState: FormState = {
	titulo: '',
	punto: {
		latitude: 0,
		longitude: 0,
	},
}

type Errors = {
	has: boolean
	titulo?: string
	tipos?: string
	dias?: string
	punto?: string
}

type FormParams = {
	id?: number
	punto?: PuntoReciclaje
	initialPosition: Coord
	tipos: TipoResiduo[]
	onSubmit: (data: FormState, tipos: number[], dias: Dia[]) => Promise<void>
}

const latitudeDelta = 0.002
const longitudeDelta = 0.002

const Form = ({ id, punto, initialPosition, tipos, onSubmit }: FormParams) => {
	let initialData = { ...defaultState, punto: initialPosition }
	if (punto) {
		initialData = {
			...initialData,
			titulo: punto.titulo || 'Titulo',
		}
	}

	const [formData, setData] = React.useState<FormState>(initialData)
	const [dias, setDias] = React.useState<Dia[]>(punto?.dias || [])
	const [selectedTipos, setTipos] = React.useState<number[]>(
		punto?.tipoResiduo.map(t => t.id) || [],
	)
	const [errors, setErrors] = React.useState<Errors>({ has: false })
	const [loading, setLoading] = React.useState(false)

	const isValid = () => {
		const newErrors: Errors = { has: false }
		if (!formData.titulo) {
			newErrors.has = true
			newErrors.titulo = 'Título no puede estar vacío'
		}

		if (!selectedTipos || selectedTipos.length < 1) {
			newErrors.has = true
			newErrors.tipos = 'Debe seleccionar al menos un tipo de residuo'
		}

		if (!dias || dias.length < 1) {
			newErrors.has = true
			newErrors.dias = 'Debe seleccionar al menos un dia'
		}

		if (!formData.punto) {
			newErrors.has = true
			newErrors.punto = 'Debe seleccionar un punto en el mapa'
		}

		setErrors(newErrors)
		return !newErrors.has
	}
	const doOnSubmit = async () => {
		setLoading(true)

		if (isValid()) await onSubmit(formData, selectedTipos, dias)

		setLoading(false)
	}

	return (
		<VStack>
			<FormControl isInvalid={'titulo' in errors}>
				<FormControl.Label>Titulo</FormControl.Label>
				<Input
					autoCapitalize="none"
					onChangeText={v => setData({ ...formData, titulo: v })}
					value={formData.titulo}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.titulo}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isInvalid={'tipos' in errors}>
				<FormControl.Label>Residuos a recibir</FormControl.Label>
				<Checkbox.Group
					defaultValue={selectedTipos.map(t => '' + t)}
					onChange={v => setTipos(v)}
				>
					{tipos.map(t => (
						<Checkbox value={'' + t.id} key={t.id} my="1">
							{t.nombre}
						</Checkbox>
					))}
				</Checkbox.Group>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.tipos}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isInvalid={'dias' in errors}>
				<FormControl.Label>Dias con disponibilidad</FormControl.Label>
				<Checkbox.Group defaultValue={dias} onChange={v => setDias(v)}>
					<VStack space="4">
						<HStack>
							<Checkbox value="0" width="75px">
								Lu
							</Checkbox>
							<Checkbox value="1" width="75px">
								Ma
							</Checkbox>
							<Checkbox value="2" width="75px">
								Mi
							</Checkbox>
							<Checkbox value="3" width="75px">
								Ju
							</Checkbox>
						</HStack>
						<HStack>
							<Checkbox value="4" width="75px">
								Vi
							</Checkbox>
							<Checkbox value="5" width="75px">
								Sa
							</Checkbox>
							<Checkbox value="6" width="75px">
								Do
							</Checkbox>
						</HStack>
					</VStack>
				</Checkbox.Group>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.dias}
				</FormControl.ErrorMessage>
			</FormControl>
			<Box height="500px" mt="2">
				<MapView
					style={{ width: '100%', height: '100%' }}
					initialRegion={{
						latitude: formData.punto.latitude,
						longitude: formData.punto.longitude,
						latitudeDelta,
						longitudeDelta,
					}}
					provider={Platform.OS === 'ios' ? null : PROVIDER_GOOGLE}
				>
					<Marker
						coordinate={{
							latitude: formData.punto.latitude,
							longitude: formData.punto.longitude,
						}}
						title={formData.titulo}
						pinColor={colors.byType['RECICLAJE']}
						draggable
						onDragEnd={p => {
							setData({
								...formData,
								punto: {
									latitude: p.nativeEvent.coordinate.latitude,
									longitude: p.nativeEvent.coordinate.longitude,
								},
							})
						}}
					/>
				</MapView>
			</Box>
			<Center mb="3">
				<Button mt="2" onPress={doOnSubmit} isLoading={loading}>
					{id ? 'Editar' : 'Crear'}
				</Button>
			</Center>
		</VStack>
	)
}
