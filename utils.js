const fs = require('fs');

// Get params
function getParams() {
	const params = process.argv.slice(2);
	const parsedParams = params.reduce((acum, actual) => {
		const [key, value] = actual.split('=');

		return {
			...acum,
			[key.replace('--', '')]: value || true
		};
	}, {});

	if (!parsedParams.path) {
		const error = new Error(
			`The script needs the path of file. Usage: node ${process.argv[1]} --path=FILEPATH`
		);
		throw error;
	}

	return parsedParams;
}

// Read file
function getData(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf8', (error, raw) => {
			if (error) {
				reject(error);
			} else {
				const lvl1 = raw.split('\n');
				const lvl2 = lvl1.map((line) =>
					line.split(',').map((c) => c.trim())
				);

				// Must be a square matrix
				if (!lvl2.every((row) => row.length === lvl2.length)) {
					const formatError = new Error('Must be a square matrix');
					reject(formatError);

					// Must be a single character matrix
				} else if (
					!lvl2.every((row) => row.every((char) => char.length === 1))
				) {
					const formatError = new Error(
						'Must be a single character matrix'
					);
					reject(formatError);

					// Valid format
				} else {
					resolve(lvl2);
				}
			}
		});
	});
}

module.exports = {
	getParams,
	getData
};
