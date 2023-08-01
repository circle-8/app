import { Http } from '../api/api'
import { Either, Maybe, ifRight, map, mapRight, maybeRight } from '../utils/either'
import { ListResponse, ResiduoResponse } from './responses'
import { ErrorMessage, Residuo } from './types'

type ResiduoSave = {
	tipoResiduoId: number
	ciudadanoId: number
	puntoResiduoId: number
	descripcion: string
	fechaLimite?: string
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
	const res = await Http.post<ResiduoResponse>(url, r)
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

export const ResiduoService = {
	save,
	list,
	fulfill,
	delete: del,
}
