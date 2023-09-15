import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
	Box,
	Button,
	FlatList,
	HStack,
	Heading,
	Spacer,
	Text,
	VStack,
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
import { TouchableOpacity } from 'react-native'

type Props = NativeStackScreenProps<ProfileRoutesParams, 'ListPuntoReciclaje'>

export const ListPuntoReciclaje = ({ navigation }: Props) => {
	const [isLoading, setLoading] = React.useState(true)
	const [recicladorId, setRecicladorId] = React.useState<number>()
	const [points, setPoints] = React.useState<PuntoReciclaje[]>([])
	const toast = useToast()

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

	React.useEffect(() => {
		loadPoints()
	}, [])

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
			<HStack space={[2, 3]} justifyContent="space-between">
				<Box alignSelf="center">
					<FontAwesome
						name="recycle"
						size={36}
						alingSelf="center"
						color={colors.primary800}
					/>
				</Box>
				<VStack>
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
					>
						{point.tipoResiduo.map(t => t.nombre).join(', ')}
					</Text>
				</VStack>
				<Spacer />
				<HStack space={4} mr={2} alignSelf="center">
					<TouchableOpacity>
						<FontAwesome
							name="pencil"
							size={30}
							color={colors.primary800}
							onPress={() =>
								navigation.navigate(ProfileRoutes.editPuntoReciclaje, {
									puntoReciclajeId: point.id,
									recicladorId,
								})
							}
						/>
					</TouchableOpacity>
					<TouchableOpacity>
						<FontAwesome
							name="trash"
							size={30}
							color={colors.primary800}
							onPress={() => toast.show({ description: 'NO IMPLEMENTADO' })}
						/>
					</TouchableOpacity>
				</HStack>
			</HStack>
		</Box>
	)

	return (
		<Box>
			<VStack space={4} alignItems="center">
				<Heading>Mis puntos de reciclaje</Heading>
				<Button
					onPress={() =>
						navigation.navigate(ProfileRoutes.editPuntoReciclaje, {
							recicladorId,
						})
					}
				>
					Nuevo
				</Button>
				<FlatList
					data={points}
					keyExtractor={p => '' + p.id}
					renderItem={({ item }) => renderPoint(item)}
				/>
			</VStack>
		</Box>
	)
}
