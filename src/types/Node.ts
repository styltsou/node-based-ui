export interface Node {
	id: string;
	type: string;
	position: {
		x: number;
		y: number;
	};
	data?: object;
}
