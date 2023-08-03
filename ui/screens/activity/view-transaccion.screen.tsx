import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ActivityRouteParams, ActivityRoutes } from '../../../constants/routes'
import {
	HStack,
	ScrollView,
	View,
	Text,
	WarningOutlineIcon,
	Card,
	useToast,
	Row,
	Column,
	Center,
	AlertDialog,
	Button,
} from 'native-base'
import { caseMaybe, match } from '../../../utils/either'
import { TransaccionService } from '../../../services/transaccion.service'
import { LoadingScreen } from '../../components/loading.component'
import { Transaccion } from '../../../services/types'
import { formatFecha } from '../../../utils/days'
import { TouchableOpacity } from 'react-native'
import { ResiduoService } from '../../../services/residuo.service'
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ViewTransaccion'>

export const ViewTransaccion = ({ navigation, route }: Props) => {
	const { ciudadanoId, transaccionId } = route.params

	const [isLoading, setLoading] = React.useState(true)

	const [transaction, setTransaction] = React.useState<Transaccion>()

	const [selectedResiduo, setSelectedResiduo] = React.useState<number>()
	const [selectedAction, setSelectedAction] = React.useState<ActionType>()

	const toast = useToast()

	const loadData = async () => {
		const transaction = await TransaccionService.get(transaccionId)
		match(
			transaction,
			t => {
				setTransaction(t)
			},
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

	const closeAlert = () => {
		setSelectedResiduo(undefined)
		setSelectedAction(undefined)
	}

	React.useEffect(() => {
		loadData()
	}, [])

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView alignContent="center">
			{transaction.residuos &&
				transaction.residuos.map(ResiduoService.mapResponse).map((r, idx) => (
					<Card
						key={r.id}
						shadow="0"
						borderWidth="0"
						borderRadius="0"
						my="1"
						p="5"
					>
						{/* TODO: esto deberia llevarse a component y evitar el copy paste con List Residuos */}
						<Row>
							<Column width="80%">
								<Text>Residuo #{r.id}</Text>
								<Text>{r.tipoResiduo.nombre}</Text>
								<Text>
									{r.limitDate?.toDateString() || 'Sin fecha limite de retiro'}
								</Text>
								<Text>
									{r.fechaRetiro
										? 'Ya ha sido retirado'
										: 'Todavia no ha sido retirado'}
								</Text>
								<Text>{r.descripcion}</Text>
							</Column>
							<Center flex="1">
								<Column space="3">
									<TouchableOpacity
										onPress={() => {
											setSelectedResiduo(r.id)
											setSelectedAction('DELETE')
										}}
									>
										<FontAwesome name="trash" size={28} alignSelf="center" />
									</TouchableOpacity>
								</Column>
							</Center>
						</Row>
					</Card>
				))}
			{transaction.residuos &&
				transaction.residuos.length > 0 &&
				transaction.residuos.filter(r => !r.fechaRetiro).length == 0 && (
					<Button
						onPress={async () => {
							const res = await TransaccionService.fulfill(transaccionId)
							match(
								res,
								p => {
									toast.show({
										description: 'Transaccion completada exitosamente',
									})
									navigation.goBack()
								},
								err => {
									toast.show({ description: err })
									navigation.goBack()
								},
							)
						}}
					>
						Completar Transaccion
					</Button>
				)}
			<AlertBeforeAction
				isOpen={selectedResiduo && selectedAction === 'DELETE'}
				action={'DELETE'}
				onCancel={closeAlert}
				onOk={async () => {
					const error = await TransaccionService.deleteResiduo(
						transaccionId,
						selectedResiduo,
					)
					caseMaybe(
						error,
						err => toast.show({ description: err }),
						() => toast.show({ description: '¡Residuo eliminado!' }),
					)
					closeAlert()
					reload()
				}}
			/>
		</ScrollView>
	)
}

type ActionType = 'DELETE'
type AlertProps = {
	isOpen: boolean
	action: ActionType
	onCancel: () => void
	onOk: () => void
}
const AlertBeforeAction = ({ isOpen, action, onCancel, onOk }: AlertProps) => {
	const cancelRef = React.useRef(null)
	const title =
		action === 'DELETE' ? 'Eliminar residuo' : 'Marcar residuo como retirado'
	const body =
		action === 'DELETE'
			? 'Esto va a eliminar el residuo, y no podrá ser retirado'
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
					<Button.Group space={2}>
						<Button onPress={onCancel} ref={cancelRef}>
							Cancelar
						</Button>
						<Button
							colorScheme={action === 'DELETE' ? 'danger' : 'primary'}
							onPress={onOk}
						>
							{action === 'DELETE' ? 'Eliminar' : 'Marcar Retirado'}
						</Button>
					</Button.Group>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog>
	)
}
