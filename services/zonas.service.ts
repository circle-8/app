import { Http } from '../api/api'
import { Either, map } from '../utils/either'
import { ListResponse, ZonaResponse } from './responses'
import { ErrorMessage, Zona } from './types'

type Filter = {
	ciudadanoId?: number
	puntoResiduoId?: number
	expandRecorrido?: boolean
	recicladorId?: number
}

const convertZonaResponseToZona = (r: ZonaResponse): Zona => {
	return {
		...r,
		puedeUnirse: false,
		puntosDentroZona: [],
	}
}

const getAll = async (
	f: Filter,
): Promise<Either<Zona[], ErrorMessage>> => {
	let url = '/zonas?'
	if (f.ciudadanoId) url += '&ciudadano_id=' + f.ciudadanoId
	if (f.puntoResiduoId) url += '&punto_residuo_id=' + f.puntoResiduoId
	if (f.recicladorId) url += '&reciclador_id=' + f.recicladorId
	if (f.expandRecorrido) url += '&expand=recorridos'
	const res = await Http.get<ListResponse<ZonaResponse>>(url)
	return map(
		res,
		p => p.data.map(convertZonaResponseToZona),
		err => err.message,
	)
}

const postJoinCircuito = async (id, puntoResiduoId): Promise<Either<ZonaResponse, ErrorMessage>> => {
	const res = await Http.post<ZonaResponse>(`/punto_residuo/${puntoResiduoId}/zona/${id}`, '')
	return map(
		res,
		p => p,
		err => err.message
	)
}

export const ZonasService = {
	getAll,
	postJoinCircuito,
}
