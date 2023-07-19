import {
	PuntoReciclajeResponse,
	PuntoResiduoResponse,
	PuntoVerdeResponse,
	UserResponse,
} from './responses'

export type TipoUsuario =
	| 'CIUDADANO'
	| 'TRANSPORTISTA'
	| 'RECICLADOR_URBANO'
	| 'RECICLADOR_PARTICULAR'
	| 'ORGANIZACION'

export type ErrorMessage = string

export type User = UserResponse

export type TipoResiduo = {
	id: number
	nombre: string
}

export type TipoPunto = 'RESIDUO' | 'RECICLAJE' | 'VERDE'

type PuntoBase = {
	id: number
	latitud: number
	longitud: number
	tipo: TipoPunto
	titulo: string
}

export type PuntoVerde = PuntoBase & PuntoVerdeResponse
export type PuntoReciclaje = PuntoBase & PuntoReciclajeResponse
export type PuntoResiduo = PuntoBase & PuntoResiduoResponse
export type Punto = PuntoReciclaje | PuntoVerde | PuntoResiduo
