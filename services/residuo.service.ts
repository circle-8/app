import { Http } from '../api/api'
import { Either, map } from '../utils/either'
import { ListResponse, ResiduoResponse, SolicitudResponse } from './responses'
import { ErrorMessage, Residuo, Solicitud } from './types'

type ResiduoSave = {
	tipoResiduoId: number
	ciudadanoId: number
	puntoResiduoId: number
	descripcion: string
	fechaLimite?: string
}

type Filter = {
	puntosResiduo?: string[]
	ciudadanos?: string[]
	tipos?: string[]
	transaccion?: string
	recorrido?: string
	retirado?: boolean
	fechaLimiteRetiro?: string
}

const getAll = async (f: Filter): Promise<Either<ResiduoResponse[], ErrorMessage>> => {
	let url = '/residuos?'
	for (const residuo of f.puntosResiduo || []) url += 'puntos_residuo=' + residuo + '&'
	for (const ciudadano of f.ciudadanos || []) url += 'ciudadanos=' + ciudadano + '&'
	for (const tipo of f.tipos || []) url += 'tipos=' + tipo + '&'
	if (f.transaccion) url += 'transaccion=' + f.transaccion
	if (f.recorrido) url += 'recorrido=' + f.recorrido
	if (f.retirado) url += 'retirado=' + f.retirado
	if (f.fechaLimiteRetiro) url += 'fecha_limite_retiro=' + f.fechaLimiteRetiro

	const res = await Http.get<ListResponse<ResiduoResponse>>(url)
	return map(
		res,
		p => p.data,
		err => err.message,
	)
}

const postSolicitarDeposito = async (
	id: number,
	idPuntoReciclaje: number,
): Promise<Either<Solicitud, ErrorMessage>> => {
	const url = `/residuo/${id}/notificacion/deposito/${idPuntoReciclaje}`;
	const res = await Http.post<SolicitudResponse>(url, {})
	return map(
		res,
		p => p as Solicitud,
		err => err.message
	)
}

const save = async (r: ResiduoSave): Promise<Either<Residuo, ErrorMessage>> => {
	const url = '/residuo'
	const res = await Http.post<ResiduoResponse>(url, r)
	return map(
		res,
		rr => ({ ...rr, createdAt: new Date(rr.fechaCreacion) }),
		err => err.message,
	)
}

export const ResiduoService = {
	getAll,
	postSolicitarDeposito,
	save
}
