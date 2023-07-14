type Left<A> = {
	t: 'LEFT'
	left: A
}

type Right<B> = {
	t: 'RIGHT'
	right: B
}

export type Either<A, B> = Left<A> | Right<B>

export const right = <A, B>(a: B): Either<A, B> => {
	return { t: 'RIGHT', right: a }
}

export const left = <A, B>(a: A): Either<A, B> => {
	return { t: 'LEFT', left: a }
}

const isLeft = <A, B>(either: Either<A, B>): either is Left<A> => {
	return either.t === 'LEFT'
}

const isRight = <A, B>(either: Either<A, B>): either is Right<B> => {
	return either.t === 'RIGHT'
}

export const match = <A, B>(
	either: Either<A, B>,
	onLeft: (l: A) => void,
	onRight: (r: B) => void,
) => {
	if (isLeft(either)) {
		onLeft(either.left)
	}
	if (isRight(either)) {
		onRight(either.right)
	}
}

export const ifLeft = <A, B>(either: Either<A, B>, onLeft: (l: A) => void) => {
	if (isLeft(either)) onLeft(either.left)
}

export const ifRight = <A, B>(
	either: Either<A, B>,
	onRight: (r: B) => void,
) => {
	if (isRight(either)) onRight(either.right)
}

export const map = <A, B, C, D>(
	either: Either<A, B>,
	mapLeft: (a: A) => C,
	mapRight: (b: B) => D,
): Either<C, D> => {
	let newEither: Either<C, D>
	match(
		either,
		l => {
			newEither = left(mapLeft(l))
		},
		r => {
			newEither = right(mapRight(r))
		},
	)

	return newEither
}
