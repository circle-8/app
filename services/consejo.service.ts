import { Http } from '../api/api'
import { Either, map } from '../utils/either'
import { ConsejoResponse, ListResponse } from './responses'
import { Consejo, ErrorMessage } from './types'

const getAll = async (
): Promise<Either<Consejo[], ErrorMessage>> => {
	let url = '/consejos'
	const res = await Http.get<ListResponse<ConsejoResponse>>(url)
    
	return map(
		res,
		p => p.data,
		err => err.message,
	)
}

export const ConsejoService = {
	getAll,
}
