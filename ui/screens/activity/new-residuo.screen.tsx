import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { AcitivityRouteParams } from '../../../constants/routes'
import {
	Box,
	Button,
	Center,
	FormControl,
	Heading,
	Input,
	ScrollView,
	Select,
	TextArea,
	VStack,
	useToast,
} from 'native-base'
import { TipoResiduoService } from '../../../services/tipos.service'
import { match } from '../../../utils/either'
import { TipoResiduo } from '../../../services/types'
import { LoadingScreen } from '../../components/loading.component'
import DateTimePicker from '@react-native-community/datetimepicker'
import { ResiduoService } from '../../../services/residuo.service'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'

type Props = NativeStackScreenProps<AcitivityRouteParams, 'NewResiduo'>

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
			fechaLimite: form.fechaLimite?.toISOString() || '',
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
				<Box safeArea p="2" py="8" w="90%" maxW="290">
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

					<VStack space={3} mt="5">
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

	const isValid = () => {
		const newErrors: Errors = { has: false }
		if (!formData.tipo) {
			newErrors.has = true
			newErrors.tipo = 'Debe elegir un tipo de residuo'
		}
		if (!formData.descripcion) {
			newErrors.has = true
			newErrors.tipo =
				'Complete la descripcion indicando que tiene disponible para retirar'
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
			<FormControl isRequired isInvalid={'descripcion' in errors}>
				<FormControl.Label>Descripcion</FormControl.Label>
				<TextArea
					onChangeText={v => setData({ ...formData, descripcion: v })}
					autoCompleteType="none"
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.descripcion}
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
