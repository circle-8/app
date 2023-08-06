import { Http } from '../api/api'
import { Either, map } from '../utils/either'
import { ListResponse, ZonaResponse } from './responses'
import { ErrorMessage, Zona } from './types'

const convertZonaResponseToZona = (r: ZonaResponse): Zona => {
	return {
		...r,
		puedeUnirse: false,
		puntosDentroZona: [],
	}
}

const getAll = async (): Promise<Either<Zona[], ErrorMessage>> => {
	const res = await Http.get<ListResponse<ZonaResponse>>(`/zonas`)
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
