import React from 'react'
import { ActivityRouteParams } from '../../../constants/routes'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { LoadingScreen } from '../../components/loading.component'
import { Zona } from '../../../services/types'
import { UserService } from '../../../services/user.service'
import { match } from '../../../utils/either'
import {
	Box,
	Button,
	Center,
	CircleIcon,
	HStack,
	ScrollView,
	Text,
	VStack,
	View,
	WarningOutlineIcon,
	useToast,
} from 'native-base'
import { ZonasService } from '../../../services/zonas.service'
import { PuntoService } from '../../../services/punto.service'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ListZonas'>

export const ListZonas = ({ navigation }: Props) => {
	const [ciudadanoId, setCiudadanoId] = React.useState<number>()
	const [zonas, setZonas] = React.useState<Zona[]>([])
	const [isLoading, setLoading] = React.useState(true)
	const toast = useToast()

	const loadData = async () => {
		const user = await UserService.getCurrent()
		setCiudadanoId(user.ciudadanoId)

		const zonas = await ZonasService.getAll({
			ciudadanoId: user.ciudadanoId,
		})
		match(
			zonas,
			t => setZonas(t),
			err => {
				toast.show({ description: err })
			},
		)

		setLoading(false)
	}

    async function handleSalir(z: Zona): Promise<void> {
        const user = await UserService.getCurrent()
        const points = await PuntoService.getAll({
			tipos: ['RESIDUO'],
			ciudadanoId: user.ciudadanoId,
		})
        const salir = await ZonasService.exclude(z.id, points[0].id)
		match(
			salir,
			t => toast.show({ description: "Te has salido del circuito con exito." }),
			err => {
				toast.show({ description: err })
			},
		)
        loadData()
    }

	React.useEffect(() => {
		const unsubscribeFocus = navigation.addListener('focus', () => {
			loadData()
		})

		return unsubscribeFocus
	}, [navigation])

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView alignContent="center">
			<Box margin={5}>
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
							<Text style={{ fontSize: 10, textAlign: 'center' }}>
								Aqui veras todos los circuitos de reciclaje a los que perteneces
								y que pueden pasar a retirar tus residuos. Tambien, si lo deseas, puedes salirte de un circuito.
							</Text>
						</View>
					</View>
					{zonas.length != 0 ? (
						zonas.map((z, idx) => (
							<Box key={`box-${idx}`} mb={2} p={2} borderWidth={1} borderColor="gray.300" borderRadius="md" shadow={1} width={350} background={'white'} >
								<Text fontSize="sm" numberOfLines={4}>
									<Text style={{ fontWeight: 'bold' }}>Zona #{z.id}</Text>{' '}
								</Text>
								<Text fontSize="sm" numberOfLines={4}>
									<Text style={{ fontWeight: 'bold' }}>Nombre:</Text> {z.nombre}
								</Text>
								<Text fontSize="sm" numberOfLines={4}>
									<Text style={{ fontWeight: 'bold' }}>
										Tipos de residuo que recoje:
									</Text>{' '}
								</Text>
								{z.tipoResiduo && z.tipoResiduo.length > 0 ? (
									z.tipoResiduo.map((tipo, index) => (
										<HStack space={2} mt="0.5" key={index} alignItems="center">
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
								<Box mb={2} />
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'center',
									}}
								>
									<Center justifyContent="space-between">
										<Button onPress={() => handleSalir(z)}>
											Salir del circuito
										</Button>
									</Center>
								</View>
							</Box>
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
									Aún no te has sumado a ningun circuito, podes hacerlo desde el
									mapa principal.
								</Text>
							</View>
						</>
					)}
				</VStack>
			</Box>
		</ScrollView>
	)
}