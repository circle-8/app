import { User, ErrorMessage } from './types'
import { TokenResponse, UserResponse } from './responses'
import { Either, map } from '../utils/either'
import { Http } from '../api/api'

const token = async (
	username: string,
	password: string
): Promise<Either<User, ErrorMessage>> => {
	const res = await Http.post<TokenResponse>('/token', { username, password })
	// TODO: persist the token using AsyncStorage
	return map(
		res,
		usr => usr.user,
		err => err.message
	)
}

type UserRequest = {
	username?: string
	password?: string
	nombre?: string
	email?: string
	isTransportista: boolean
}

const post = async ({
	username,
	password,
	nombre,
	email,
	isTransportista,
}: UserRequest): Promise<Either<User, ErrorMessage>> => {
	const res = await Http.post<UserResponse>('/user', {
		username,
		password,
		nombre,
		email,
		tipoUsuario: isTransportista ? 'TRANSPORTISTA' : 'CIUDADANO',
	})
	return map(
		res,
		usr => usr,
		err => err.message
	)
}

export const UserService = {
	token,
	post,
}
