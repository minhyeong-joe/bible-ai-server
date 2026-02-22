import {
	fetchVersions,
	fetchBooks,
	fetchChapters,
	fetchVerses,
} from "../lib/bibleApi.js";

export const getVersions = async (req, res) => {
	try {
		const data = await fetchVersions();
		res.json(data);
	} catch (error) {
		console.error("Error fetching versions:", error.message);
		res.status(502).json({ error: "Failed to fetch Bible versions." });
	}
};

export const getBooks = async (req, res) => {
	const { version } = req.params;
	try {
		const data = await fetchBooks(version);
		res.json(data);
	} catch (error) {
		console.error(`Error fetching books for ${version}:`, error.message);
		res
			.status(502)
			.json({ error: `Failed to fetch books for version "${version}".` });
	}
};

export const getChapters = async (req, res) => {
	const { version, bookId } = req.params;
	try {
		const data = await fetchChapters(version, bookId);
		res.json(data);
	} catch (error) {
		console.error(
			`Error fetching chapters for ${version}/${bookId}:`,
			error.message,
		);
		res
			.status(502)
			.json({ error: `Failed to fetch chapters for "${version}/${bookId}".` });
	}
};

export const getVerses = async (req, res) => {
	const { version, bookId, chapter } = req.params;
	if (isNaN(Number(chapter))) {
		return res.status(400).json({ error: "Chapter must be a number." });
	}
	try {
		const data = await fetchVerses(version, bookId, chapter);
		res.json(data);
	} catch (error) {
		console.error(
			`Error fetching verses for ${version}/${bookId}/${chapter}:`,
			error.message,
		);
		res
			.status(502)
			.json({
				error: `Failed to fetch verses for "${version}/${bookId}/${chapter}".`,
			});
	}
};
