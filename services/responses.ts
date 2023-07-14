import { TipoUsuario } from './types'

type ErrorCode =
	| 'INTERNAL_ERROR'
	| 'BAD_REQUEST'
	| 'NOT_FOUND'
	| 'TOKEN_ERROR'
	| 'TOKEN_NOT_FOUND'
	| 'TOKEN_EXPIRED'

export type ErrorResponse = {
	code: ErrorCode
	message: string
	devMessage: string
}

export type UserResponse = {
	id: number
	username: string
	nombre: string
	email: string
	tipoUsuario: TipoUsuario
}

export type TokenResponse = {
	token: string
	refreshToken: string
	user: UserResponse
}

export type ListResponse<T> = {
	pageNumber: number
	totalPages: number
	pageSize: number
	count: number
	data: T[]
}

export type PuntoResponse = {
	id: number
	latitud: number
	longitud: number
}

export type PuntoResiduoResponse = PuntoResponse

export type DiaResponse = '0' | '1' | '2' | '3' | '4' | '5' | '6'

export type TipoResiduoResponse = {
	id: number
	nombre: string
}

export type PuntoVerdeResponse = PuntoResponse & {
	dias: DiaResponse[]
	tipoResiduo: TipoResiduoResponse[]
}

export type PuntoReciclajeResponse = PuntoVerdeResponse & {
	recicladorUri?: string
	recicladorId?: number
	reciclador?: unknown
}
