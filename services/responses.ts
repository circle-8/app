import { TipoUsuario } from './types';

type ErrorCode = 'INTERNAL_ERROR' | 'BAD_REQUEST' | 'NOT_FOUND';
export type ErrorResponse = {
	code: ErrorCode;
	message: string;
	devMessage: string;
};

export type UserResponse = {
	id: number;
	username: string;
	nombre: string;
	email: string;
	tipoUsuario: TipoUsuario;
};

export type TokenResponse = {
	token: string;
	refreshToken: string;
	user: UserResponse;
};
