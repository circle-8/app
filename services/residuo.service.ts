import { Http } from '../api/api'
import { ListResponse, ResiduoResponse, SolicitudResponse } from './responses'
import { ErrorMessage, Residuo, Solicitud } from './types'
import {
	Either,
	Maybe,
	ifRight,
	map,
	mapRight,
	maybeRight,
} from '../utils/either'

type ResiduoSave = {
	id?:number
	tipoResiduoId: number
	ciudadanoId: number
	puntoResiduoId: number
	descripcion: string
	fechaLimite?: string
	base64?: string
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

const getAll = async (
	f: Filter,
): Promise<Either<ResiduoResponse[], ErrorMessage>> => {
	let url = '/residuos?'
	for (const residuo of f.puntosResiduo || [])
		url += 'puntos_residuo=' + residuo + '&'
	for (const ciudadano of f.ciudadanos || [])
		url += 'ciudadanos=' + ciudadano + '&'
	for (const tipo of f.tipos || []) url += 'tipos=' + tipo + '&'
	if (f.transaccion) url += 'transaccion=' + f.transaccion + '&'
	if (f.recorrido) url += 'recorrido=' + f.recorrido + '&'
	if (f.retirado === false) url += 'retirado=false&'
	if (f.retirado === true) url += 'retirado=true&'
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
	const url = `/residuo/${id}/notificacion/deposito/${idPuntoReciclaje}`
	const res = await Http.post<SolicitudResponse>(url, {})
	return map(
		res,
		p => p as Solicitud,
		err => err.message,
	)
}

const mapResponse = (r: ResiduoResponse): Residuo => {
	return {
		...r,
		createdAt: new Date(r.fechaCreacion),
		limitDate: r.fechaLimiteRetiro ? new Date(r.fechaLimiteRetiro) : undefined,
	}
}

const save = async (r: ResiduoSave): Promise<Either<Residuo, ErrorMessage>> => {
	const url = '/residuo'
	const res = r.id ? await Http.put<ResiduoResponse>(url+`/${r.id}`, r) : await Http.post<ResiduoResponse>(url, r)
	return map(res, mapResponse, err => err.message)
}

const get = async (id: number): Promise<Either<Residuo, ErrorMessage>> => {
	const url = `/residuo/${id}?expand=base64`
	const res = await Http.get<ResiduoResponse>(url)
	return map(res, mapResponse, err => err.message)
}

type ResiduoFilter = {
	puntosResiduo?: number[]
	ciudadano?: number[]
	tipo?: number[]
	transaccion?: number
	recorrido?: number
	retirado?: boolean
	fechaLimiteRetiro?: Date
}

const makeParams = (url: string, f: ResiduoFilter): string => {
	let finalUrl = url + '?'
	for (const p of f.puntosResiduo || []) finalUrl += `puntos_residuo=${p}&`
	for (const c of f.ciudadano || []) finalUrl += `ciudadanos=${c}&`
	for (const t of f.tipo || []) finalUrl += `tipos=${t}&`
	if (f.transaccion) finalUrl += `transaccion=${f.transaccion}&`
	if (f.recorrido) finalUrl += `recorrido=${f.recorrido}&`
	if (f.retirado === true) finalUrl += 'retirado=true&'
	if (f.retirado === false) finalUrl += 'retirado=false&'
	if (f.fechaLimiteRetiro)
		finalUrl += `fecha_limite_retiro=${f.fechaLimiteRetiro.toISOString()}`

	return finalUrl
}

const list = async (
	f: ResiduoFilter,
): Promise<Either<Residuo[], ErrorMessage>> => {
	const url = makeParams('/residuos', f)
	const res = await Http.get<ListResponse<ResiduoResponse>>(url)
	return map(
		res,
		rr => rr.data.map(mapResponse),
		err => err.message,
	)
}

const fulfill = async (id: number): Promise<Maybe<ErrorMessage>> => {
	const url = `/residuo/${id}/fulfill`
	const res = await Http.post<ResiduoResponse>(url)

	return maybeRight(mapRight(res, err => err.message))
}

const del = async (id: number): Promise<Maybe<ErrorMessage>> => {
	const url = `/residuo/${id}`
	const res = await Http.delete<null>(url)

	return maybeRight(mapRight(res, err => err.message))
}

const addRecorrido = async (id: number): Promise<Maybe<ErrorMessage>> => {
	const url = `/residuo/${id}/reciclaje`
	const res = await Http.post<ResiduoResponse>(url)

	return maybeRight(mapRight(res, err => err.message))
}

export const ResiduoService = {
	getAll,
	postSolicitarDeposito,
	save,
	list,
	fulfill,
	delete: del,
	mapResponse,
	addRecorrido,
	get,
}
