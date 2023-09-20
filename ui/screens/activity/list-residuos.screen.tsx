import React from 'react'
import { ActivityRouteParams, ActivityRoutes, ProfileRoutes, TabRoutes } from '../../../constants/routes'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { LoadingScreen } from '../../components/loading.component'
import { PuntoResiduo, Residuo } from '../../../services/types'
import { UserService } from '../../../services/user.service'
import { ResiduoService } from '../../../services/residuo.service'
import { caseMaybe, match } from '../../../utils/either'
import {
	AlertDialog,
	Box,
	Button,
	Center,
	ScrollView,
	Text,
	VStack,
	View,
	WarningOutlineIcon,
	useToast,
} from 'native-base'
import { FontAwesome, FontAwesome5, MaterialCommunityIcons  } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { colors } from '../../../constants/styles'
import { PuntoService } from '../../../services/punto.service'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ListResiduos'>

export const ListResiduos = ({ navigation }: Props) => {
	const [ciudadanoId, setCiudadanoId] = React.useState<number>()
	const [residuos, setResiduos] = React.useState<Residuo[]>([])
	const [isLoading, setLoading] = React.useState(true)
	const [selectedResiduo, setSelectedResiduo] = React.useState<number>()
	const [selectedAction, setSelectedAction] = React.useState<ActionType>()
	const toast = useToast()

	const loadData = async () => {
		const user = await UserService.getCurrent()
		setCiudadanoId(user.ciudadanoId)

		const residuos = await ResiduoService.list({
			ciudadano: [user.ciudadanoId],
			retirado: false,
			fechaLimiteRetiro: new Date(),
		})
		match(
			residuos,
			r => setResiduos(r),
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)

		setLoading(false)
	}

	const reload = () => {
		setLoading(true)
		loadData()
	}

	const handleNewResiduo = async () => {
		
		const user = await UserService.getCurrent()
		const points = await PuntoService.getAll({
			tipos: ['RESIDUO'],
			ciudadanoId: user.ciudadanoId,
		})

		if (points.length === 0) {
			//TODO ir a editar punto residuo si no tiene punto residuo
		} else {
			navigation.navigate(ActivityRoutes.newResiduo, {
				ciudadanoId: user.ciudadanoId,
				puntoResiduoId: points[0].id,
			})
		}

	}

	React.useEffect(() => {
		loadData()
	}, [])

	if (isLoading) return <LoadingScreen />

	const closeAlert = () => {
		setSelectedResiduo(undefined)
		setSelectedAction(undefined)
	}

	return (
		<ScrollView alignContent="center">
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
								Aqui veras todos tus residuos, puedes marcarlos como entregados,
								editarlos, eliminarlos o incluirlos a un recorrido de tu zona de reciclaje.
							</Text>
						</View>
						<TouchableOpacity
							onPress={() => handleNewResiduo() }
							style={{ backgroundColor: 'transparent' }}
						>
							<FontAwesome name="plus" size={30} color={colors.primary800} />
						</TouchableOpacity>
					</View>
					{ residuos.length != 0 ? residuos.map((r, idx) => (
						<Box
							key={`box-${idx}`}
							mb={2}
							p={2}
							borderWidth={1}
							borderColor="gray.300"
							borderRadius="md"
							shadow={1}
							width={350}
							background={'white'}
						>
							<Text fontSize="sm" numberOfLines={4}>
								<Text style={{ fontWeight: 'bold' }}>Residuo #{r.id}</Text>{' '}
							</Text>
							<Text fontSize="sm" numberOfLines={4}>
								<Text style={{ fontWeight: 'bold' }}>Tipo:</Text>{' '}
								{r.tipoResiduo.nombre}
							</Text>
							<Text fontSize="sm" numberOfLines={4}>
								<Text style={{ fontWeight: 'bold' }}>Fecha limite:</Text>{' '}
								{r.limitDate?.toLocaleDateString() ||
									'Sin fecha limite de retiro'}
							</Text>
							<Text fontSize="sm" numberOfLines={25}>
								<Text style={{ fontWeight: 'bold' }}>Descripcion:</Text>{' '}
								{r.descripcion}
							</Text>
							<Text></Text>
							<Center>
								<Box mb={2} />
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<View style={{ marginHorizontal: 20 }}>
										<TouchableOpacity
											onPress={() => {
												setSelectedResiduo(r.id)
												setSelectedAction('FULFILL')
											}}
										>
											<FontAwesome5
												name="box-open"
												size={28}
												alignSelf="center"
											/>
										</TouchableOpacity>
									</View>
									<View style={{ marginHorizontal: 20 }}>
										<TouchableOpacity
											onPress={() => {
												toast.show({ description: 'NO IMPLEMENTADO' })
											}}
										>
											<FontAwesome name="pencil" size={28} alignSelf="center" />
										</TouchableOpacity>
									</View>
									<View style={{ marginHorizontal: 20 }}>
										<TouchableOpacity
											onPress={() => {
												setSelectedResiduo(r.id)
												setSelectedAction('DELETE')
											}}
										>
											<FontAwesome name="trash" size={28} alignSelf="center" />
										</TouchableOpacity>
									</View>
									<View style={{ marginHorizontal: 20 }}>
										<TouchableOpacity
											onPress={() => {
												setSelectedResiduo(r.id)
												setSelectedAction('DELIVERY')
											}}
										>
											<MaterialCommunityIcons
												name="truck-delivery"
												size={28}
												alignSelf="center"
												color="black"
											/>
										</TouchableOpacity>
									</View>
								</View>
							</Center>
						</Box>
					)) : (
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
								Aún no has cargado tus residuos en la aplicación.
								</Text>
							</View>
						</>
					)}
					<AlertBeforeAction
						isOpen={selectedResiduo && selectedAction === 'DELETE'}
						action={'DELETE'}
						onCancel={closeAlert}
						onOk={async () => {
							const error = await ResiduoService.delete(selectedResiduo)
							caseMaybe(
								error,
								err => toast.show({ description: err }),
								() => toast.show({ description: '¡Residuo eliminado!' }),
							)
							closeAlert()
							reload()
						}}
					/>
					<AlertBeforeAction
						isOpen={selectedResiduo && selectedAction === 'FULFILL'}
						action={'FULFILL'}
						onCancel={closeAlert}
						onOk={async () => {
							const error = await ResiduoService.fulfill(selectedResiduo)
							caseMaybe(
								error,
								err => toast.show({ description: err }),
								() => toast.show({ description: '¡Residuo retirado!' }),
							)
							closeAlert()
							reload()
						}}
					/>
					<AlertBeforeAction
						isOpen={selectedResiduo && selectedAction === 'DELIVERY'}
						action={'DELIVERY'}
						onCancel={closeAlert}
						onOk={async () => {
							const error = await ResiduoService.addRecorrido(selectedResiduo)
							caseMaybe(
								error,
								err => toast.show({ description: err }),
								() =>
									toast.show({ description: '¡Residuo agregado correctamente!' }),
							)
							closeAlert()
							reload()
						}}
					/>
				</VStack>
			</Box>
		</ScrollView>
	)
}

type ActionType = 'DELETE' | 'FULFILL' | 'DELIVERY'
type AlertProps = {
	isOpen: boolean
	action: ActionType
	onCancel: () => void
	onOk: () => void
}
const AlertBeforeAction = ({ isOpen, action, onCancel, onOk }: AlertProps) => {
	const cancelRef = React.useRef(null)
	const title =
		action === 'DELETE' ? 'Eliminar residuo' : 
		action === 'DELIVERY' ? 'Agregar residuo a un circuito de reciclaje'
			: 'Marcar residuo como retirado'
	const body =
		action === 'DELETE'
			? 'Se eliminara el residuo y no podrá ser retirado' :
		action === 'DELIVERY' 
			? 'Se añadira el residuo a un recorrido' 
			: 'Se marcara el residuo como retirado y no podrá volver a ser retirado'
	return (
		<AlertDialog
			leastDestructiveRef={cancelRef}
			isOpen={isOpen}
			onClose={onCancel}
		>
			<AlertDialog.Content>
				<AlertDialog.CloseButton />
				<AlertDialog.Header>{title}</AlertDialog.Header>
				<AlertDialog.Body>{body}</AlertDialog.Body>
				<AlertDialog.Footer>
					<Center flex={1}>
						<Button.Group space={2}>
							<Button onPress={onCancel} ref={cancelRef}>
								Cancelar
							</Button>
							<Button
								colorScheme={action === 'DELETE' ? 'danger' : 'primary'}
								onPress={onOk}
							>
								{action === 'DELETE'
									? 'Eliminar'
									: action === 'DELIVERY'
									? 'Agregar a recorrido'
									: 'Marcar Retirado'}
							</Button>
						</Button.Group>
					</Center>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog>
	)
}