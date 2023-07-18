import { Http } from '../api/api'
import { ifLeft } from '../utils/either'
import {
	ListResponse,
	PuntoReciclajeResponse,
	PuntoResiduoResponse,
	PuntoResponse,
	PuntoVerdeResponse,
} from './responses'
import { Punto, TipoPunto } from './types'

const mapPoint = {
	RESIDUO: {
		url: '/puntos_residuo?expand=ciudadano&',
	},
	RECICLAJE: {
		url: '/puntos_reciclaje?',
	},
	VERDE: {
		url: '/puntos_verdes',
	},
}

const getAll = async (
	tipos: TipoPunto[],
	residuos: String[],
	dias: String[],
): Promise<Punto[]> => {
	const points: Punto[] = []

	for (const tipo of tipos)
		points.push(...(await getPuntos(tipo, residuos, dias)))

	return points
}

const getPuntos = async (
	tipo: TipoPunto,
	residuos: String[],
	dias: String[],
): Promise<Punto[]> => {
	var url = mapPoint[tipo].url
	for (const residuo of residuos)
		url = url.concat('tipos_residuo=' + residuo + '&')
	for (const dia of dias) url = url.concat('dias=' + dia + '&')

	const response = await Http.get<ListResponse<PuntoResponse>>(url)

	const points = []
	ifLeft(response, l =>
		points.push(
			...l.data.map(t => {
				let titulo: string
				if (tipo === 'RESIDUO') {
					const res = t as PuntoResiduoResponse
					titulo = `Retirá los residuos de ${res.ciudadano?.username || ''}`
				} else if (tipo == 'VERDE') {
					titulo = (t as PuntoVerdeResponse).titulo || 'Punto Verde'
				} else {
					titulo = (t as PuntoReciclajeResponse).titulo
				}

				return { ...t, tipo, titulo }
			}),
		),
	)

	return points
}

export const PuntoServicio = {
	getAll,
}
