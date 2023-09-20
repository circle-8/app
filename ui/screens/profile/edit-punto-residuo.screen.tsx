import React from 'react'
import {
	Box,
	Button,
	Center,
	Heading,
	ScrollView,
	Text,
	VStack,
	useToast,
} from 'native-base'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ProfileRoutesParams } from '../../../constants/routes'
import * as Location from 'expo-location'
import { PuntoService } from '../../../services/punto.service'
import { LoadingScreen } from '../../components/loading.component'
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'
import { colors } from '../../../constants/styles'
import { match } from '../../../utils/either'
import { Platform } from 'react-native'

type Props = NativeStackScreenProps<ProfileRoutesParams, 'EditPuntoResiduo'>

// TODO: llevar a types.ts
type Coord = {
	latitude: number
	longitude: number
}

export const EditPuntoResiduo = ({ navigation, route }: Props) => {
	const [initialMarkerCoord, setInitialMarkerCoord] = React.useState<Coord>()
	const [isLoading, setLoading] = React.useState(true)
	const toast = useToast()

	const puntoResiduo = route.params?.punto
	const ciudadanoId = route.params?.ciudadanoId

	const getUserLocation = async () => {
		return await Location.getCurrentPositionAsync()
	}

	const loadInitialData = async () => {
		if (puntoResiduo) {
			setInitialMarkerCoord({
				latitude: puntoResiduo.latitud,
				longitude: puntoResiduo.longitud,
			})
			setLoading(false)
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
		const unsubscribeFocus = navigation.addListener('focus', () => {
			loadInitialData()
		})

		return unsubscribeFocus
	}, [navigation])

	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<ScrollView>
			<Center w="100%">
				<Box safeArea p="2" w="90%" maxW="320">
					<Heading
						size="lg"
						fontWeight="600"
						color="coolGray.800"
						alignSelf="center"
					>
						Punto de retiro
					</Heading>

					{!puntoResiduo && (
						<Text>Antes de poder entregar tus residuos, tenés que indicar dónde pueden retirarlos</Text>
					)}

					<Text>¿Dónde pueden pasar a retirar tus residuos?</Text>
					<Form
						id={puntoResiduo?.id}
						initialPosition={initialMarkerCoord}
						onSubmit={async formData => {
							const savedPunto = await PuntoService.savePuntoResiduo({
								id: puntoResiduo?.id,
								ciudadanoId: ciudadanoId,
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
	punto: Coord
}

type FormParams = {
	id?: number
	initialPosition: Coord
	onSubmit: (data: FormState) => Promise<void>
}

const latitudeDelta = 0.002
const longitudeDelta = 0.002

const Form = ({ id, initialPosition, onSubmit }: FormParams) => {
	const initialData: FormState = { punto: initialPosition }

	const [formData, setData] = React.useState<FormState>(initialData)
	const [loading, setLoading] = React.useState(false)

	const doOnSubmit = async () => {
		setLoading(true)
		await onSubmit(formData)
		setLoading(false)
	}

	return (
		<VStack>
			<Box height="500px" mt="2">
				<MapView
					style={{ width: '100%', height: '100%' }}
					initialRegion={{
						latitude: formData.punto.latitude,
						longitude: formData.punto.longitude,
						latitudeDelta,
						longitudeDelta,
					}}
					provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
				>
					<Marker
						coordinate={{
							latitude: formData.punto.latitude,
							longitude: formData.punto.longitude,
						}}
						title="Punto de retiro"
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
				<Button mt="2" onPress={doOnSubmit} isLoading={loading} w="100%">
					{id ? 'Editar' : 'Crear'}
				</Button>
			</Center>
		</VStack>
	)
}
