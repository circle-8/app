import { User, ErrorMessage } from './types'
import { TokenResponse, UserResponse } from './responses'
import { Either, ifLeft, map, match } from '../utils/either'
import { Http } from '../api/api'
import { TokenService } from './token.service'

const token = async (
	username: string,
	password: string
): Promise<Either<User, ErrorMessage>> => {
	const res = await Http.post<TokenResponse>('/token', { username, password })
	ifLeft(res, t => {
		TokenService.set('access', t.token)
		TokenService.set('refresh', t.refreshToken)
	})

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

const isLogged = async () => {
	return (
		await TokenService.get('access') !== null && await TokenService.get('refresh') !== null
	)
}

const refreshToken = async (): Promise<ErrorMessage | null> => {
	const accessToken = await TokenService.get('access')
	const refreshToken = await TokenService.get('refresh')
	const res = await Http.post<TokenResponse>('/refresh_token', {
		accessToken,
		refreshToken,
	})
	ifLeft(res, async t => {
		await TokenService.set('access', t.token)
		await TokenService.set('refresh', t.refreshToken)
	})

	let ret: ErrorMessage | null
	match(
		res,
		t => (ret = null),
		err => (ret = err.message)
	)

	return ret
}

export const UserService = {
	token,
	post,
	isLogged,
	refreshToken,
}
