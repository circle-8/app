import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
	Box,
	Button,
	Center,
	FlatList,
	HStack,
	Heading,
	ScrollView,
	Spacer,
	Text,
	VStack,
	View,
	useToast,
} from 'native-base'
import React from 'react'
import { ProfileRoutes, ProfileRoutesParams } from '../../../constants/routes'
import { FontAwesome } from '@expo/vector-icons'
import { PuntoReciclaje } from '../../../services/types'
import { PuntoService } from '../../../services/punto.service'
import { LoadingScreen } from '../../components/loading.component'
import { UserService } from '../../../services/user.service'
import { colors } from '../../../constants/styles'
import { Dimensions, TouchableOpacity } from 'react-native'
import { match } from '../../../utils/either'

type Props = NativeStackScreenProps<ProfileRoutesParams, 'ListPuntoReciclaje'>

export const ListPuntoReciclaje = ({ navigation }: Props) => {
	const [isLoading, setLoading] = React.useState(true)
	const [recicladorId, setRecicladorId] = React.useState<number>()
	const [points, setPoints] = React.useState<PuntoReciclaje[]>([])
	const toast = useToast()
	const windowWidth = Dimensions.get('window').width;
	const flatListWidth = windowWidth - 20;

	const loadPoints = async () => {
		const user = await UserService.getCurrent()
		const listPoints = await PuntoService.getAll({
			tipos: ['RECICLAJE'],
			recicladorId: user.ciudadanoId,
		})
		setRecicladorId(user.ciudadanoId)
		setPoints(listPoints.map(p => p as PuntoReciclaje))
		setLoading(false)
	}

	const handleEliminar = async (id: number, recicladorId: number) => {
		const elim = await PuntoService.del(id, recicladorId)

		if (elim.t === 'RIGHT') {
			toast.show({ description: '¡Punto Eliminado con exito!' })
			loadPoints()
		} else {
			toast.show({ description: 'No se pudo eliminar el punto, puede que tengas solicitudes asociadas que impidan eliminarlo, cancela las solicitudes y reintenta.' })
			loadPoints()
		}
	}

	React.useEffect(() => {
		const unsubscribeFocus = navigation.addListener('focus', () => {
			loadPoints()
		})

		return unsubscribeFocus
	}, [navigation])

	if (isLoading) {
		return <LoadingScreen />
	}

	const renderPoint = (point: PuntoReciclaje) => (
		<Box
		borderBottomWidth="1"
		_dark={{
		  borderColor: 'muted.50',
		}}
		borderColor="muted.800"
		pl={['0', '4']}
		pr={['0', '5']}
		py="2"
	  >
		<HStack space={[2, 3]} justifyContent="space-between" alignItems="center">
		  <Box alignSelf="center">
			<FontAwesome name="recycle" size={36} color={colors.primary800} />
		  </Box>
		  <VStack style={{ flex: 1 }}>
			<Text
			  _dark={{
				color: 'warmGray.50',
			  }}
			  color="coolGray.800"
			  bold
			>
			  {point.titulo}
			</Text>
			<Text
			  color="coolGray.600"
			  _dark={{
				color: 'warmGray.200',
			  }}
			  numberOfLines={6}
			  ellipsizeMode="tail"
			  style={{ maxWidth: '100%' }}
			>
			  {point.tipoResiduo.map(t => t.nombre).join(', ')}
			</Text>
		  </VStack>
		  <HStack space={4} mr={2}>
			<TouchableOpacity
			  onPress={() =>
				navigation.navigate(ProfileRoutes.editPuntoReciclaje, {
				  puntoReciclajeId: point.id,
				  recicladorId,
				})
			  }
			>
			  <FontAwesome
				name="pencil"
				size={30}
				color={colors.primary800}
			  />
			</TouchableOpacity>
			<TouchableOpacity
			  onPress={() => handleEliminar(point.id, point.recicladorId)}
			>
			  <FontAwesome name="trash" size={30} color={colors.primary800} />
			</TouchableOpacity>
		  </HStack>
		</HStack>
	  </Box>
	  
	)

	return (
		<Box margin={10}>
			<VStack space={4} alignItems="center" alignSelf="center">
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginTop: 2,
					}}
				>
					<View style={{ flex: 1, marginRight: 10 }}>
						<Text style={{ fontSize: 10, textAlign: 'left' }}>
							Los puntos creados serán visualizados en el mapa como "Punto de
							reciclaje particular" para que otros usuarios puedan conectar
							contigo.
						</Text>
					</View>
					<TouchableOpacity
						onPress={() =>
							navigation.navigate(ProfileRoutes.editPuntoReciclaje, {
								recicladorId,
							})
						}
						style={{ backgroundColor: 'transparent' }}
					>
						<FontAwesome name="plus" size={30} color={colors.primary800} />
					</TouchableOpacity>
				</View>
				<FlatList
					style={{ width: flatListWidth }}
					data={points}
					keyExtractor={p => '' + p.id}
					renderItem={({ item }) => renderPoint(item)}
					contentContainerStyle={{
						paddingTop: 20,
						paddingLeft: 20,
						paddingRight: 20,
						paddingBottom: 20,
					}}
				/>
			</VStack>
		</Box>
	)
}
