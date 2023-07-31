import React from 'react'
import { AcitivityRouteParams } from '../../../constants/routes'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { LoadingScreen } from '../../components/loading.component'
import { Residuo } from '../../../services/types'
import { UserService } from '../../../services/user.service'
import { ResiduoService } from '../../../services/residuo.service'
import { caseMaybe, match } from '../../../utils/either'
import {
	AlertDialog,
	Box,
	Button,
	Card,
	Center,
	Column,
	Flex,
	Row,
	Text,
	useToast,
} from 'native-base'
import { FontAwesome, EvilIcons, FontAwesome5 } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'

type Props = NativeStackScreenProps<AcitivityRouteParams, 'ListResiduos'>

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
			ciudadano: [ciudadanoId],
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

	React.useEffect(() => {
		loadData()
	}, [])

	if (isLoading) return <LoadingScreen />

	const closeAlert = () => {
		setSelectedResiduo(undefined)
		setSelectedAction(undefined)
	}

	return (
		<Box p="3">
			{residuos.map(r => (
				<Card
					key={r.id}
					shadow="0"
					borderWidth="0"
					borderRadius="0"
					my="1"
					p="5"
				>
					<Row>
						<Column width="80%">
							<Text>Residuo #{r.id}</Text>
							<Text>{r.tipoResiduo.nombre}</Text>
							<Text>
								{r.limitDate?.toDateString() || 'Sin fecha limite de retiro'}
							</Text>
							<Text>{r.descripcion}</Text>
						</Column>
						<Center flex="1">
							<Column space="3">
								<TouchableOpacity
									onPress={() => {
										setSelectedResiduo(r.id)
										setSelectedAction('FULFILL')
									}}
								>
									<FontAwesome5 name="box-open" size={28} alignSelf="center" />
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => {
										toast.show({ description: 'NO IMPLEMENTADO' })
									}}
								>
									<FontAwesome name="pencil" size={28} alignSelf="center" />
								</TouchableOpacity>
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
				}}
			/>
		</Box>
	)
}

type ActionType = 'DELETE' | 'FULFILL'
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
