import { DiaResponse } from '../services/responses'

const map = {
	'0': 'Lunes',
	'1': 'Martes',
	'2': 'Miércoles',
	'3': 'Jueves',
	'4': 'Viernes',
	'5': 'Sábado',
	'6': 'Domingo',
}

export const mapDays = (d: DiaResponse) => {
	return map[d]
}
