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
	ciudadanoId: number
}

export type TokenResponse = {
	token: string
	refreshToken: string
	user: UserResponse
}

export type ListResponse<T> = {
	fechaCreacion: string | number | Date
	pageNumber: number
	totalPages: number
	pageSize: number
	count: number
	data: T[]
}

export type DiaResponse = '0' | '1' | '2' | '3' | '4' | '5' | '6'

export type CiudadanoResponse = {
	id: number
	username: string
	nombre: string
	email: string
	tipoUsuario: TipoUsuario
}


type PuntoResponseBase = {
	id: number
	latitud: number
	longitud: number
}

export type PuntoResiduoResponse = PuntoResponseBase & {
	ciudadanoId: number
	ciudadanoUri: string
	ciudadano?: CiudadanoResponse
	residuos?: ResiduoResponse[]
}

export type TipoResiduoResponse = {
	id: number
	nombre: string
}

export type PuntoVerdeResponse = PuntoResponseBase & {
	dias: DiaResponse[]
	tipoResiduo: TipoResiduoResponse[]
	titulo: string
}

export type PuntoReciclajeResponse = PuntoVerdeResponse & {
	recicladorUri: string
	recicladorId: number
	reciclador?: unknown
	titulo: string
}

export type PuntoResponse = PuntoResiduoResponse | PuntoVerdeResponse | PuntoReciclajeResponse

export type ResiduoResponse = {
	id: number
	descripcion: string
	fechaCreacion: string
	fechaRetiro?: string
	fechaLimiteRetiro: string
	puntoResiduoUri: string
	puntoResiduoId: number
	puntoResiduo?: {
		id: number
		ciudadanoId: number
	}
	tipoResiduo: TipoResiduoResponse
}

export type SolicitudResponse = {
	id: number
	solicitanteId: number
	solicitante: UserResponse
	solicitadoId: number
	solicitado: UserResponse
	estado: string
	residuo: ResiduoResponse
	canceladorId: number
	puntoReciclajeId: number
}

export type TransaccionResponse = {
	id: number
	fechaCreacion: string
	fechaRetiro: string
	puntoReciclajeUri: UserResponse
	puntoReciclajeId: number
	puntoReciclaje?: PuntoReciclajeResponse
	residuos?: ResiduoResponse[]
}

export type PolylineResponse = {
	latitud: number
	longitud: number
}

export type ZonaResponse = {
	id: number
	nombre: string
	polyline: PolylineResponse[]
	organizacionId: number
	tipoResiduo: TipoResiduoResponse[]
}
