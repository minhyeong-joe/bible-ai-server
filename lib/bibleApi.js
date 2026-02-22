import { BibleChapter } from "../models/Bible.js";

const EXTERNAL_API = "https://bible-api.com/data";

const apiFetch = async (url) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`External Bible API error: ${response.status} ${response.statusText} (${url})`,
		);
	}
	return response.json();
};

export const fetchVersions = async () => {
	return apiFetch(EXTERNAL_API);
};

export const fetchBooks = async (version) => {
	return apiFetch(`${EXTERNAL_API}/${version}`);
};

export const fetchChapters = async (version, bookId) => {
	return apiFetch(`${EXTERNAL_API}/${version}/${bookId}`);
};

export const fetchVerses = async (version, bookId, chapter) => {
	const versionKey = version.toLowerCase();
	const bookKey = bookId.toUpperCase();
	const chapterNum = Number(chapter);

	// check DB
	const cached = await BibleChapter.findOne({
		version: versionKey,
		bookId: bookKey,
		chapter: chapterNum,
	});

	if (cached) {
		console.log(`[BibleCache] found  ${versionKey}/${bookKey}/${chapterNum}`);
		return {
			translation: cached.translation,
			verses: cached.verses,
		};
	}

	console.log(
		`[BibleCache] not found ${versionKey}/${bookKey}/${chapterNum} — fetching from API`,
	);
	const data = await apiFetch(
		`${EXTERNAL_API}/${versionKey}/${bookKey}/${chapterNum}`,
	);

	await BibleChapter.findOneAndUpdate(
		{ version: versionKey, bookId: bookKey, chapter: chapterNum },
		{
			translation: data.translation,
			verses: data.verses,
		},
		{ upsert: true, returnDocument: "after" },
	);

	return data;
};
