import { Http } from '../api/api'
import { ifLeft } from '../utils/either'
import { ListResponse, PuntoResponse } from './responses'
import { Punto, TipoPunto } from './types'

const getAll = async (tipos: TipoPunto[]): Promise<Punto[]> => {
	const points: Punto[] = []

	for (const tipo of tipos) {
		switch (tipo) {
			case 'RESIDUO':
				points.push(...(await getPuntos('/puntos_residuo', 'RESIDUO')))
				break;
			case 'RECICLAJE':
				points.push(...(await getPuntos('/puntos_reciclaje', 'RECICLAJE')))
				break;
			case 'VERDE':
				points.push(...(await getPuntos('/puntos_verdes', 'VERDE')))
				break;
			default:
				console.error("El tipo seleccionado no es correcto, verifique y reintente.")
				break;
		}
	}

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
