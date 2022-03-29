const { getParams, getData } = require('./utils');

// Optimize
const map = {};

/*
e -> east
se -> southeast
s -> south
sw -> southwest
*/
function next({ matrix, char, row, column, direction }) {
	const isLastRow = matrix.length - 1 === row;
	const isLastColumn = matrix[row].length - 1 === column;

	let newRow = row;
	let newColumn = column;
	switch (direction) {
		case 'e':
			if (isLastColumn) {
				return undefined;
			}
			newColumn = column + 1;
			break;

		case 'se':
			if (isLastRow || isLastColumn) {
				return undefined;
			}
			newRow = row + 1;
			newColumn = column + 1;
			break;

		case 's':
			if (isLastRow) {
				return undefined;
			}
			newRow = row + 1;
			break;

		case 'sw':
		default:
			if (isLastRow) {
				return undefined;
			}
			newRow = row + 1;
			newColumn = column - 1;
			break;
	}

	const mapKey = `${newRow}${newColumn}${direction}`;

	if (newColumn >= 0 && !map[mapKey]) {
		const newValue = matrix[newRow][newColumn];
		if (char === newValue) {
			map[mapKey] = true;
			const part = next({
				matrix,
				char,
				row: newRow,
				column: newColumn,
				direction
			});
			if (part) {
				return [char, ...part];
			}
			return [char];
		}
	}
	return undefined;
}

function initSearch(matrix, row, column) {
	const search = [];
	const isLastRow = matrix.length - 1 === row;
	const isLastColumn = matrix[row].length - 1 === column;
	const char = matrix[row][column];
	const params = { matrix, char, row, column };

	if (!isLastColumn && !map[`${row}${column}e`]) {
		const e = next({ ...params, direction: 'e' });
		search.push([char, ...(e || [])]);
	}
	if (!isLastRow && !isLastColumn && !map[`${row}${column}se`]) {
		const se = next({ ...params, direction: 'se' });
		search.push([char, ...(se || [])]);
	}
	if (!isLastRow && !map[`${row}${column}s`]) {
		const s = next({ ...params, direction: 's' });
		search.push([char, ...(s || [])]);
	}
	if (!isLastRow && !map[`${row}${column}sw`]) {
		const sw = next({ ...params, direction: 'sw' });
		search.push([char, ...(sw || [])]);
	}

	return search;
}

// Main
async function main() {
	try {
		const params = getParams();
		const matrix = await getData(params.path);

		let longChain;

		for (let i = 0; i < matrix.length; i++) {
			for (let j = 0; j < matrix[i].length; j++) {
				const test = initSearch(matrix, i, j);

				test.forEach((list) => {
					if (!longChain || list.length > longChain[0].length) {
						longChain = [[...list]];
					} else if (list.length === longChain[0].length) {
						longChain.push([...list]);
					}
				});
			}
		}

		if (!params.multiResults) {
			console.log(
				'\x1b[4mResult:\x1b[0m',
				longChain[0].join(', '),
				` (${longChain[0].length})`
			);
		} else {
			console.log('\x1b[4mResults:\x1b[0m');
			longChain.forEach((list) => {
				console.log(list.join(', '), ` (${list.length})`);
			});
		}
	} catch (err) {
		console.log(`\x1b[31m[ERROR]: ${err.message}\x1b[0m`);
		process.exit(1);
	}
}

main();
