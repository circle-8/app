import { User, ErrorMessage } from './types';
import { TokenResponse } from './responses';
import { Either, map } from '../utils/either';
import { Http } from '../api/api';

const token = async (
	username: string,
	password: string
): Promise<Either<User, ErrorMessage>> => {
	const res = await Http.post<TokenResponse>('/token', { username, password });
	// TODO: persist the token using AsyncStorage
	return map(
		res,
		(usr) => usr.user,
		(err) => err.message
	);
};

export const UserService = {
	token,
};
