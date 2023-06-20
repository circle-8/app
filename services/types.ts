export type TipoUsuario =
	| 'CIUDADANO'
	| 'TRANSPORTISTA'
	| 'RECICLADOR_URBANO'
	| 'RECICLADOR_PARTICULAR'
	| 'ORGANIZACION';

export type ErrorMessage = string;

export type User = {
	id: number;
	username: string;
	nombre: string;
	email: string;
	tipoUsuario: TipoUsuario;
};
