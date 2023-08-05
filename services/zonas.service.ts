import { Http } from '../api/api'
import { Either, map } from '../utils/either'
import { ListResponse, ZonasResponse } from './responses'
import { ErrorMessage, Zonas } from './types'

const getAll = async (): Promise<Either<Zonas[], ErrorMessage>> => {
	const res = await Http.get<ListResponse<ZonasResponse>>(`/zonas`)
	return map(
		res,
		p => p.data,
		err => err.message,
	)
}

export const ZonasService = {
	getAll,
}
