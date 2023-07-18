import React from 'react'
import {
	NativeStackNavigationProp,
	NativeStackScreenProps,
} from '@react-navigation/native-stack'
import {
	Box,
	Button,
	Center,
	Checkbox,
	FormControl,
	Heading,
	Input,
	ScrollView,
	VStack,
	useToast,
} from 'native-base'
import { LoginRoutesParams } from '../../../constants/routes'
import { UserService } from '../../../services/user.service'
import { match } from '../../../utils/either'

type Props = NativeStackScreenProps<LoginRoutesParams, 'SignUp'>
export const SignUp = ({ navigation }: Props) => {
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
						¡Registrate!
					</Heading>

					<VStack space={3} mt="5">
						<Form navigation={navigation} />
					</VStack>
				</Box>
			</Center>
		</ScrollView>
	)
}

type FormState = {
	username?: string
	password?: string
	nombre?: string
	email?: string
}

type Errors = {
	has: boolean
	username?: string
	password?: string
	nombre?: string
	email?: string
}

const Form = ({
	navigation,
}: {
	navigation: NativeStackNavigationProp<LoginRoutesParams>
}) => {
	const [formData, setData] = React.useState<FormState>({})
	const [isTransportista, setTransportista] = React.useState<boolean>(false)
	const [errors, setErrors] = React.useState<Errors>({ has: false })
	const [loading, setLoading] = React.useState(false)
	const toast = useToast()

	const isValid = () => {
		const newErrors: Errors = { has: false }
		if (!formData.username) {
			newErrors.has = true
			newErrors.username = 'Usuario no puede estar vacío'
		}
		if (!formData.password) {
			newErrors.has = true
			newErrors.password = 'Contraseña no puede estar vacío'
		}
		if (!formData.email) {
			newErrors.has = true
			newErrors.email = 'Dirección de e-mail no puede estar vacío'
		}
		if (!formData.nombre) {
			newErrors.has = true
			newErrors.nombre = 'Nombre y Apellido no puede estar vacío'
		}

		setErrors(newErrors)
		return !newErrors.has
	}
	const onSubmit = async () => {
		setLoading(true)
		if (isValid()) {
			const res = await UserService.post({ ...formData, isTransportista })
			match(
				res,
				usr => {
					toast.show({ description: '¡Registro exitoso!' })
					navigation.popToTop()
				},
				err => toast.show({ description: err })
			)
		}

		setLoading(false)
	}

	return (
		<>
			<FormControl isRequired isInvalid={'username' in errors}>
				<FormControl.Label>Usuario</FormControl.Label>
				<Input
					autoCapitalize="none"
					onChangeText={v => setData({ ...formData, username: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.username}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isRequired isInvalid={'password' in errors}>
				<FormControl.Label>Contraseña</FormControl.Label>
				<Input
					type="password"
					autoCapitalize="none"
					onChangeText={v => setData({ ...formData, password: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.password}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isRequired isInvalid={'nombre' in errors}>
				<FormControl.Label>Nombre y Apellido</FormControl.Label>
				<Input
					autoCapitalize="words"
					onChangeText={v => setData({ ...formData, nombre: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.nombre}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isRequired isInvalid={'email' in errors}>
				<FormControl.Label>Dirección de e-mail</FormControl.Label>
				<Input
					autoCapitalize="none"
					onChangeText={v => setData({ ...formData, email: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.email}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl>
				<FormControl.Label>Quiero ser transportista</FormControl.Label>
				<Checkbox
					value={'true'}
					accessibilityLabel="Quiero ser transportista"
					onChange={v => setTransportista(v)}
					size="lg"
				/>
			</FormControl>
			<Button
				mt="10"
				onPress={onSubmit}
				isLoading={loading}
			>
				Registrarse
			</Button>
		</>
	)
}
