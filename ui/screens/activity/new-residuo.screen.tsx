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
import { Residuo, TipoResiduo } from '../../../services/types'
import { LoadingScreen } from '../../components/loading.component'
import DateTimePicker from '@react-native-community/datetimepicker'
import { ResiduoService } from '../../../services/residuo.service'
import { Keyboard } from 'react-native'

type Props = NativeStackScreenProps<ActivityRouteParams, 'NewResiduo'>

export const NewResiduo = ({ navigation, route }: Props) => {
	const residuoId = route.params?.residuoId ? route.params?.residuoId : undefined
	const { ciudadanoId, puntoResiduoId } = route.params
	const [tipos, setTipos] = React.useState<TipoResiduo[]>()
	const [isLoading, setLoading] = React.useState(true)
	const [residuo, setResiduo] = React.useState<Residuo>()
	const [formData, setFormData] = React.useState<FormState>({
		tipo: residuo?.tipoResiduo.id,
		descripcion: residuo?.descripcion || '',
		fechaLimite: residuo?.fechaLimiteRetiro ? new Date(residuo.fechaLimiteRetiro) : null,
	  });
	const [embalajeDefault, setEmbalajeDefault] = React.useState<string[]>([])
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

		if (residuoId) {
			// Es pantalla de edicion
			const r = await ResiduoService.get(residuoId)
			match(
				r,
				residuo => {
					setResiduo(residuo)
					setFormData({
						tipo: residuo.tipoResiduo.id,
						descripcion: getDescripcion(residuo.descripcion),
						fechaLimite: residuo.fechaLimiteRetiro ? new Date(residuo.fechaLimiteRetiro) : null,
					  });
					setEmbalajeDefault(getChecks(residuo.descripcion))
					setLoading(false)
				},
				err => {
					toast.show({ description: err })
					navigation.goBack()
				},
			)
		}
			
		setLoading(false)
		setLoading(false)
	}

	function getDescripcion(cadena) {
		  const partes = cadena.split('\u200B\n');
		  const descripcion = partes[0].trim();
		  return descripcion
	  }

	  function getChecks(cadena) {
		const partes = cadena.split('\u200B\n');
		const entregaInfo = partes.slice(1);
		let values: string[] = [];

		if (entregaInfo[0].includes('caja')){ values.push('0')}
		if (entregaInfo[0].includes('bolsa')){ values.push('1')}
		if (entregaInfo[0].includes('compacto')){ values.push('2')}
		if (entregaInfo[0].includes('Mojado/Húmedo')){ values.push('3')}
		if (entregaInfo[0].includes('5kg')){ values.push('4')}
		return values
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
			id: residuo? residuo.id : null,
		})
		match(
			savedResiduo,
			r => {
				residuo ? toast.show({ description: 'Residuo editado exitosamente' }) : toast.show({ description: 'Residuo creado exitosamente' })
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
				<Box p="2" py="2" w="90%" maxW="290">
					<VStack space={3} mt="4">
						<Form onSubmit={onSubmit} tipos={tipos} formData={formData} setFormData={setFormData} r={residuo}/>
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
	formData,
	setFormData,
	r,
  }: {
	onSubmit: (form: FormState) => Promise<void>;
	tipos: TipoResiduo[];
	formData: FormState;
	setFormData: React.Dispatch<React.SetStateAction<FormState>>;
	r: Residuo
  }) => {
	const [errors, setErrors] = React.useState<Errors>({ has: false })
	const [showDatePicker, setShowDatePicker] = React.useState(false)
	const [loading, setLoading] = React.useState(false)
	const [selectedDate, setSelectedDate] = React.useState(null)
	const [selectedBefore, setSelectedBefore] = React.useState<string[]>([])
	const [selectedEntregado, setSelectedEntregado] = React.useState<string[]>(() => 
	{
		if (r) {
			const partes = r.descripcion.split('\u200B\n');
			const entregaInfo = partes.slice(1);
			let values: string[] = [];
		
			if (entregaInfo[0].includes('caja')) { values.push('0'); }
			if (entregaInfo[0].includes('bolsa')) { values.push('1'); }
			if (entregaInfo[0].includes('compacto')) { values.push('2'); }
			if (entregaInfo[0].includes('Mojado/Húmedo')) { values.push('3'); }
			if (entregaInfo[0].includes('5kg')) { values.push('4'); }
		
			setSelectedBefore(values)
			return [...values]; 
		  }
		
		  return [];
		})
	  
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
			formData.descripcion = r.descripcion.split('\u200B\n').slice(0)[0] 
			setFormData({
				...formData,
			})
		}

		setErrors(newErrors)
		return !newErrors.has
	}

	const onChangeDate = (event, selected) => {
		const currentDate = selected || formData.fechaLimite
		setShowDatePicker(false)
		setFormData({ ...formData, fechaLimite: currentDate })
	}

	const doSubmit = async () => {
		setLoading(true)

		const selectedDescriptions = []
		if (formData.descripcion) {
			selectedDescriptions.push(formData.descripcion)
			selectedDescriptions.push(
				'\u200B\nAdemas tene en cuenta estas caracteristicas para retirar el residuo: ',
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

		setFormData({
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

	const handleSelecciono = values => {
		console.log(values)
		console.log(selectedBefore)
		const combinedSelections = [...selectedBefore, ...values]
		console.log(combinedSelections)

		const uniqueSelections = Array.from(new Set(combinedSelections))
		console.log(uniqueSelections)
		setSelectedBefore(uniqueSelections)
		setSelectedEntregado(uniqueSelections)
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
					selectedValue={formData.tipo ? `${formData.tipo}` : ''}
					placeholder="Tipo de Residuo"
					onValueChange={v =>
						setFormData({ ...formData, tipo: v ? parseInt(v) : undefined })
					}
				>
					{tipos.map(t => (
						<Select.Item value={`${t.id}`} key={t.id} label={t.nombre} />
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
					onChangeText={v => setFormData({ ...formData, descripcion: v })}
					value={formData.descripcion}
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
					value={selectedEntregado}
					accessibilityLabel="Elige las características que se asemejen más a la manera en la que vas a entregar tu residuo."
					onChange={(values) => {
						handleSelecciono(values)
					  }}
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
				{r?.id ? 'Editar' : 'Crear'}
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