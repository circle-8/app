import React from 'react'
import {
	Box,
	Text,
	Heading,
	VStack,
	FormControl,
	Input,
	Link,
	Button,
	HStack,
	Center,
	useToast,
} from 'native-base'

import { AuthContext } from '../../../context/auth.context'
import { UserService } from '../../../services/user.service'
import { match } from '../../../utils/either'
import { LoginRoutes, LoginRoutesParams } from '../../../constants/routes'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

type Props = NativeStackScreenProps<LoginRoutesParams, 'Login'>

export const Login = ({ navigation }: Props) => {
	return (
		<Center w="100%">
			<Box safeArea p="2" py="8" w="90%" maxW="290">
				<Heading
					size="lg"
					fontWeight="600"
					color="coolGray.800"
					alignSelf="center"
				>
					Circle 8
				</Heading>

				<VStack space={3} mt="5">
					<Form />
					<HStack mt="6" justifyContent="center">
						<Text
							fontSize="sm"
							color="coolGray.600"
						>
							Soy un nuevo usuario.{' '}
						</Text>
						<Link
							_text={{
								color: 'primary.700',
								fontWeight: 'medium',
								fontSize: 'sm',
							}}
							onPress={() => {
								navigation.navigate(LoginRoutes.signup)
							}}
						>
							Quiero registrarme
						</Link>
					</HStack>
				</VStack>
			</Box>
		</Center>
	)
}

type FormState = {
	username?: string
	password?: string
}

type Errors = {
	has: boolean
	username?: string
	password?: string
}

const Form = () => {
	const { login } = React.useContext(AuthContext)
	const [formData, setData] = React.useState<FormState>({})
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

		setErrors(newErrors)
		return !newErrors.has
	}
	const onSubmit = async () => {
		setLoading(true)

		if (isValid()) {
			const res = await UserService.token(formData.username, formData.password)
			match(
				res,
				user => login(user), // This will trigger the login in App.tsx, rendering the Home Screen
				err => toast.show({ description: err })
			)
		}

		setLoading(false)
	}

	return (
		<>
			<FormControl isInvalid={'username' in errors}>
				<FormControl.Label>Usuario</FormControl.Label>
				<Input
					autoCapitalize="none"
					onChangeText={v => setData({ ...formData, username: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.username}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isInvalid={'password' in errors}>
				<FormControl.Label>Contraseña</FormControl.Label>
				<Input
					autoCapitalize="none"
					type="password"
					onChangeText={v => setData({ ...formData, password: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.password}
				</FormControl.ErrorMessage>
			</FormControl>
			<Button
				mt="2"
				onPress={onSubmit}
				isLoading={loading}
			>
				Iniciar Sesión
			</Button>
		</>
	)
}
