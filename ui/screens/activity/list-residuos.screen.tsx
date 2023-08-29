import React from 'react'
import { ActivityRouteParams } from '../../../constants/routes'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { LoadingScreen } from '../../components/loading.component'
import { Residuo, Zona } from '../../../services/types'
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
	View,
	useToast,
} from 'native-base'
import { FontAwesome, FontAwesome5, MaterialCommunityIcons  } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'

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
			<Center w="100%">
				<Box mb={5} />
				{residuos.map(r => (
					<Box
						mb={2}
						p={2}
						borderWidth={1}
						borderColor="gray.300"
						borderRadius="md"
						shadow={1}
						width={350}
						background={'white'}
					>
						<Text>Residuo #{r.id}</Text>
						<Text>{r.tipoResiduo.nombre}</Text>
						<Text>
							{r.limitDate?.toLocaleDateString() ||
								'Sin fecha limite de retiro'}
						</Text>
						<Text>{r.descripcion}</Text>
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
										<MaterialCommunityIcons name="truck-delivery" size={28} alignSelf="center" color="black" />
									</TouchableOpacity>
								</View>
							</View>
						</Center>
					</Box>
				))}
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
							() => toast.show({ description: '¡Residuo agregado correctamente!' }),
						)
						closeAlert()
						reload()
					}}
				/>
			</Center>
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
			? 'Esto va a eliminar el residuo, y no podrá ser retirado' :
		action === 'DELIVERY' 
			? 'se añadiria el residuo a un recorrido' 
			: 'Esto marcará el residuo como retirado y no podrá volver a ser retirado'
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