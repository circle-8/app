import {
	ConsejoResponse,
	DiaResponse,
	PuntoReciclajeResponse,
	PuntoResiduoResponse,
	PuntoVerdeResponse,
	RecorridoResponse,
	ResiduoResponse,
	SolicitudResponse,
	TipoResiduoResponse,
	TransaccionResponse,
	TransporteResponse,
	UserResponse,
	ZonaResponse,
} from './responses'

export type TipoUsuario =
	| 'CIUDADANO'
	| 'TRANSPORTISTA'
	| 'RECICLADOR_URBANO'
	| 'RECICLADOR_PARTICULAR'
	| 'ORGANIZACION'

export type ErrorMessage = string

export type User = UserResponse

export type Dia = DiaResponse

export type TipoResiduo = TipoResiduoResponse

export type Residuo = ResiduoResponse & {
	createdAt: Date
	limitDate?: Date
}

export type TipoPunto = 'RESIDUO' | 'RECICLAJE' | 'VERDE'

type PuntoBase = {
	id: number
	latitud: number
	longitud: number
	tipo: TipoPunto
	titulo: string
}

export type Zona = ZonaResponse & {
	puedeUnirse: boolean
	puntosDentroZona: Punto[]
}

export type PuntoVerde = PuntoBase & PuntoVerdeResponse
export type PuntoReciclaje = PuntoBase & PuntoReciclajeResponse
export type PuntoResiduo = PuntoBase & PuntoResiduoResponse
export type Punto = PuntoReciclaje | PuntoVerde | PuntoResiduo
export type Solicitud = SolicitudResponse
export type Transaccion = TransaccionResponse
export type Recorrido = RecorridoResponse & {
	date: Date
	initDate?: Date
	endDate?: Date
}
export type Transporte = TransporteResponse
export type Consejo = ConsejoResponse