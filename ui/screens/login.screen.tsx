import React from 'react';
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
} from 'native-base';

import { AuthContext } from '../../context/auth.context';
import { UserService } from '../../services/user.service';
import { match } from '../../utils/either';

export const Login = ({ navigation }) => {
	return (
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
					Circle 8
				</Heading>

				<VStack space={3} mt="5">
					<Form />
					<HStack mt="6" justifyContent="center">
						<Text
							fontSize="sm"
							color="coolGray.600"
							_dark={{
								color: 'warmGray.200',
							}}
						>
							Soy un nuevo usuario.{' '}
						</Text>
						<Link
							_text={{
								color: 'indigo.500',
								fontWeight: 'medium',
								fontSize: 'sm',
							}}
							href="#"
						>
							Quiero registrarme
						</Link>
					</HStack>
				</VStack>
			</Box>
		</Center>
	);
};

type FormState = {
	username?: string;
	password?: string;
};

type Errors = {
	has: boolean;
	username?: string;
	password?: string;
};

const Form = () => {
	const { login } = React.useContext(AuthContext);
	const [formData, setData] = React.useState<FormState>({});
	const [errors, setErrors] = React.useState<Errors>({ has: false });
	const [loading, setLoading] = React.useState(false);
	const toast = useToast();

	const isValid = () => {
		const newErrors: Errors = { has: false };
		if (!formData.username) {
			newErrors.has = true;
			newErrors.username = 'Usuario no puede estar vacío';
		}

		if (!formData.password) {
			newErrors.has = true;
			newErrors.password = 'Contraseña no puede estar vacío';
		}

		setErrors(newErrors);
		return !newErrors.has;
	};
	const onSubmit = async () => {
		setLoading(true);

		if (isValid()) {
			const res = await UserService.token(formData.username, formData.password);
			match(
				res,
				(user) => login(user), // This will trigger the login in App.tsx, rendering the Home Screen
				(err) => toast.show({ description: err })
			);
		}

		setLoading(false);
	};

	return (
		<>
			<FormControl isRequired isInvalid={'username' in errors}>
				<FormControl.Label>Usuario</FormControl.Label>
				<Input
					autoCapitalize="none"
					onChangeText={(v) => setData({ ...formData, username: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.username}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isRequired isInvalid={'password' in errors}>
				<FormControl.Label>Contraseña</FormControl.Label>
				<Input
					autoCapitalize="none"
					type="password"
					onChangeText={(v) => setData({ ...formData, password: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.password}
				</FormControl.ErrorMessage>
				<Link
					_text={{
						fontSize: 'xs',
						fontWeight: '500',
						color: 'indigo.500',
					}}
					alignSelf="flex-end"
					mt="1"
				>
					¿Olvidó su contraseña?
				</Link>
			</FormControl>
			<Button
				mt="2"
				colorScheme="indigo"
				onPress={onSubmit}
				isLoading={loading}
			>
				Iniciar Sesión
			</Button>
		</>
	);
};
