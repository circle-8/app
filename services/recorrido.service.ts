import { Http } from '../api/api'
import { Either, Maybe, map, mapRight, maybeRight } from '../utils/either'
import { ListResponse, RecorridoResponse } from './responses'
import { ErrorMessage, Recorrido } from './types'

type RecorridoFilter = {
	recicladorId?: number
	organizacionId?: number
	zonaId?: number
	fechaRetiro?: Date
}

const get = async(id: number): Promise<Either<Recorrido, ErrorMessage>> => {
	const res = await Http.get<RecorridoResponse>(`/recorrido/${id}`)
	return map(
		res,
		r => ({
				...r,
				date: new Date(r.fechaRetiro),
				initDate: r.fechaInicio ? new Date(r.fechaInicio) : undefined,
				endDate: r.fechaFin ? new Date(r.fechaFin) : undefined,
			}),
		err => err.message,
	)
}

const list = async (
	f: RecorridoFilter,
): Promise<Either<Recorrido[], ErrorMessage>> => {
	const url = makeParams('/recorridos', f)
	const res = await Http.get<ListResponse<RecorridoResponse>>(url)
	return map(
		res,
		rr =>
			rr.data.map(r => ({
				...r,
				date: new Date(r.fechaRetiro),
				initDate: r.fechaInicio ? new Date(r.fechaInicio) : undefined,
				endDate: r.fechaFin ? new Date(r.fechaFin) : undefined,
			})),
		err => err.message,
	)
}

const makeParams = (url: string, f: RecorridoFilter): string => {
	let finalUrl = url + '?'
	if (f.recicladorId) finalUrl += `reciclador_id=${f.recicladorId}&`
	if (f.organizacionId) finalUrl += `organizacion_id=${f.organizacionId}&`
	if (f.zonaId) finalUrl += `zona_id=${f.zonaId}&`
	if (f.fechaRetiro)
		finalUrl += `fecha_retiro=${f.fechaRetiro.toISOString().split('T')[0]}`

	return finalUrl
}

const init = async(id: number): Promise<Maybe<ErrorMessage>> => {
	const url = `/recorrido/${id}/inicio`
	const res = await Http.post<RecorridoResponse>(url)

	return maybeRight(mapRight(res, err => err.message))
}

const finish = async(id: number): Promise<Maybe<ErrorMessage>> => {
	const url = `/recorrido/${id}/fin`
	const res = await Http.post<RecorridoResponse>(url)

	return maybeRight(mapRight(res, err => err.message))
}

export const RecorridoService = {
	get,
	list,
	init,
	finish,
}
