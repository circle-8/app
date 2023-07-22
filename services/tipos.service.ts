import { Http } from '../api/api'
import { Either, map } from '../utils/either'
import { ListResponse, TipoResiduoResponse } from './responses'
import { ErrorMessage, TipoResiduo } from './types'

const getAll = async (): Promise<Either<TipoResiduo[], ErrorMessage>> => {
	const res = await Http.get<ListResponse<TipoResiduoResponse>>('/tipos_residuo')
	return map(
		res,
		p => p.data,
		err => err.message,
	)
}

export const TipoResiduoService = {
	getAll,
}
