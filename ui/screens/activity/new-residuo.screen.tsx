import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { ActivityRouteParams } from '../../../constants/routes'
import {
	Box,
	Button,
	Center,
	FormControl,
	Heading,
	Input,
	Modal,
	ScrollView,
	Select,
	TextArea,
	VStack,
	View,
	useToast,
	Text,
	Checkbox,
} from 'native-base'
import { TipoResiduoService } from '../../../services/tipos.service'
import { match } from '../../../utils/either'
import { TipoResiduo } from '../../../services/types'
import { LoadingScreen } from '../../components/loading.component'
import DateTimePicker from '@react-native-community/datetimepicker'
import { ResiduoService } from '../../../services/residuo.service'
import { Keyboard } from 'react-native'

type Props = NativeStackScreenProps<ActivityRouteParams, 'NewResiduo'>

export const NewResiduo = ({ navigation, route }: Props) => {
	const { ciudadanoId, puntoResiduoId } = route.params
	const [tipos, setTipos] = React.useState<TipoResiduo[]>()
	const [isLoading, setLoading] = React.useState(true)
	const toast = useToast()

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
		setLoading(false)
	}

	React.useEffect(() => {
		loadInitialData()
	}, [])

	const onSubmit = async (form: FormState) => {
		const savedResiduo = await ResiduoService.save({
			ciudadanoId,
			puntoResiduoId,
			descripcion: form.descripcion,
			tipoResiduoId: form.tipo,
			fechaLimite: form.fechaLimite?.toISOString() || null,
		})
		match(
			savedResiduo,
			r => {
				toast.show({ description: 'Residuo creado exitosamente' })
				navigation.popToTop()
			},
			err => {
				toast.show({ description: err })
			},
		)
	}

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView>
			<Center w="100%">
				<Box safeArea p="2" py="4" w="90%" maxW="290">
					<Heading
						size="lg"
						fontWeight="600"
						color="coolGray.800"
						_dark={{
							color: 'warmGray.50',
						}}
						alignSelf="center"
					>
						Nuevo Residuo
					</Heading>

					<VStack space={3} mt="4">
						<Form onSubmit={onSubmit} tipos={tipos} />
					</VStack>
				</Box>
			</Center>
		</ScrollView>
	)
}

type FormState = {
	tipo?: number
	descripcion?: string
	fechaLimite?: Date
}

type Errors = {
	has: boolean
	tipo?: string
	descripcion?: string
	entrega?: string
}

const Form = ({
	onSubmit,
	tipos,
}: {
	onSubmit: (form: FormState) => Promise<void>
	tipos: TipoResiduo[]
}) => {
	const [formData, setData] = React.useState<FormState>({})
	const [errors, setErrors] = React.useState<Errors>({ has: false })
	const [showDatePicker, setShowDatePicker] = React.useState(false)
	const [loading, setLoading] = React.useState(false)
	const [selectedDate, setSelectedDate] = React.useState(null)
	const [selectedEntregado, setSelectedEntregado] = React.useState<string[]>([])

	const isValid = () => {
		const newErrors: Errors = { has: false }
		if (!formData.tipo) {
			newErrors.has = true
			newErrors.tipo = 'Debe elegir un tipo de residuo'
		}
		if (!formData.descripcion || formData.descripcion === '') {
			newErrors.has = true
			newErrors.descripcion =
				'Complete la descripcion indicando que tiene disponible para retirar'
		}
		if (selectedEntregado.length === 0) {
			newErrors.has = true
			newErrors.entrega =
				'Seleccione al menos una caracteristica sobre como entregas el residuo.'
		}

		setErrors(newErrors)
		return !newErrors.has
	}

	const onChangeDate = (event, selected) => {
		const currentDate = selected || formData.fechaLimite
		setShowDatePicker(false)
		setData({ ...formData, fechaLimite: currentDate })
	}

	

	const doSubmit = async () => {
		setLoading(true)

		const selectedDescriptions = []
		if (formData.descripcion) {
			selectedDescriptions.push(formData.descripcion)
			selectedDescriptions.push(
				'\nAdemas tene en cuenta estas caracteristicas para retirar el residuo: ',
			)
			selectedEntregado.forEach(value => {
				switch (value) {
					case '0':
						selectedDescriptions.push('Se entrega embalado en caja.')
						break
					case '1':
						selectedDescriptions.push('Se entrega embalado en bolsa.')
						break
					case '2':
						selectedDescriptions.push('Es compacto.')
						break
					case '3':
						selectedDescriptions.push('Está Mojado/Húmedo.')
						break
					case '4':
						selectedDescriptions.push('Pesa más de 5kg.')
						break
					default:
						break
				}
			})
		}

		formData.descripcion = selectedDescriptions.join(' ')

		setData({
			...formData,
		})

		if (isValid()) {
			await onSubmit(formData)
			setLoading(false)
			return
		}

		setLoading(false)
	}

	const formatDate = date => {
		if (!date) return ''
		return new Intl.DateTimeFormat('es', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(date)
	}

	return (
		<>
			{showDatePicker && (
				<DateTimePicker
					value={formData.fechaLimite || new Date()}
					mode="date"
					display="default"
					onChange={onChangeDate}
					minimumDate={new Date()}
				/>
			)}
			<FormControl isRequired isInvalid={'tipo' in errors} isReadOnly>
				<FormControl.Label>Tipo de Residuo</FormControl.Label>
				<Select
					selectedValue={'' + formData.tipo}
					placeholder="Tipo de Residuo"
					onValueChange={v => setData({ ...formData, tipo: +v })}
				>
					{tipos.map(t => (
						<Select.Item value={'' + t.id} key={t.id} label={t.nombre} />
					))}
				</Select>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.tipo}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isRequired isInvalid={'entrega' in errors}>
				<FormControl.Label>Descripcion</FormControl.Label>
				<Text fontSize="sm" color="coolGray.500">
					Agrega informacion que te parezca util.
				</Text>
				<TextArea
					onChangeText={v => setData({ ...formData, descripcion: v })}
					autoCompleteType="none"
					isInvalid={'descripcion' in errors}
				/>
				<Text fontSize="xs" color="red.500">
					{errors.descripcion}
				</Text>

				<Text fontSize="sm" color="coolGray.500">
					Selecciona cómo va a ser entregado
				</Text>
				<Text fontSize="xs" color="gray.400" mt={1}>
					Indica las características que se asemejen a cómo entregas el residuo
					para que los recicladores lo tengan en cuenta.
				</Text>
				<Checkbox.Group
					colorScheme="green"
					defaultValue={selectedEntregado}
					accessibilityLabel="Elegi las caracteristicas que se asemejen mas a la manera en la que vas a entregar tu residuo."
					onChange={values => setSelectedEntregado(values || [])}
				>
					<Checkbox value="0" my={1}>
						Embalado en caja
					</Checkbox>
					<Checkbox value="1" my={1}>
						Embalado en bolsa
					</Checkbox>
					<Checkbox value="2" my={1}>
						Compacto
					</Checkbox>
					<Checkbox value="3" my={1}>
						Mojado/Humedo
					</Checkbox>
					<Checkbox value="4" my={1}>
						Pesa mas de 5kg
					</Checkbox>
				</Checkbox.Group>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.entrega}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl>
				<FormControl.Label>Fecha limite de retiro</FormControl.Label>
				<Input
					onFocus={() => {
						setShowDatePicker(true)
						Keyboard.dismiss()
					}}
					value={formatDate(formData.fechaLimite)}
					editable={false}
				/>
			</FormControl>
			<Button mt="10" onPress={doSubmit} isLoading={loading}>
				Crear
			</Button>
		</>
	)
}

/*

MODAL QUE FUNCIONA OK EN IOS

const onChangeDate = (event, selected) => {
		const currentDate = selected || formData.fechaLimite
		setSelectedDate(currentDate)
	}

	const handleSetDate = () => {
		setShowDatePicker(false)
		setData({ ...formData, fechaLimite: selectedDate })
	}

{showDatePicker && (
	<Modal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}>
		<Modal.Content>
			<Modal.CloseButton />
			<Modal.Header alignItems="center">
				<Text bold fontSize="xl">
					Selecciona fecha limite
				</Text>
			</Modal.Header>
			<Modal.Body>
				<View style={{ flex: 1, justifyContent: 'flex-end' }}>
					<DateTimePicker
						value={selectedDate || new Date()}
						mode="date"
						display="inline"
						minimumDate={new Date()}
						onChange={onChangeDate}
					/>
					<Button onPress={() => handleSetDate()}> ok </Button>
				</View>
			</Modal.Body>
		</Modal.Content>
	</Modal>
)}
*/