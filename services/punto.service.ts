import { Http } from '../api/api'
import { ifLeft } from '../utils/either'
import { ListResponse, PuntoResponse } from './responses'
import { Punto, TipoPunto } from './types'

const getAll = async (): Promise<Punto[]> => {
	const points: Punto[] = []

	points.push(...(await getPuntos('/puntos_residuo', 'RESIDUO')))
	points.push(...(await getPuntos('/puntos_reciclaje', 'RECICLAJE')))
	points.push(...(await getPuntos('/puntos_verdes', 'VERDE')))

	return points
}

const getPuntos = async (url: string, tipo: TipoPunto): Promise<Punto[]> => {
	const puntosVerdes = await Http.get<ListResponse<PuntoResponse>>(url)

	const points = []
	ifLeft(puntosVerdes, l => points.push(...l.data.map(t => ({ ...t, tipo, titulo: `${tipo} ${t.id}` }))))

	return points
}

export const PuntoServicio = {
	getAll,
}
