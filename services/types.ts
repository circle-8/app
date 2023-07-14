export type TipoUsuario =
	| 'CIUDADANO'
	| 'TRANSPORTISTA'
	| 'RECICLADOR_URBANO'
	| 'RECICLADOR_PARTICULAR'
	| 'ORGANIZACION'

export type ErrorMessage = string

export type User = {
	id: number
	username: string
	nombre: string
	email: string
	tipoUsuario: TipoUsuario
}

export type TipoPunto = 'RESIDUO' | 'RECICLAJE' | 'VERDE'

export type Punto = {
	id: number
	latitud: number
	longitud: number
	tipo: TipoPunto
	titulo: string
}
