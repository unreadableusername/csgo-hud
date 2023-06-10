import { mkdir } from 'fs/promises'

import { merge } from 'lodash-es'

import { themesDirectory, userspaceBombsitesPath, userspaceDirectory, userspaceRadarsPath, userspaceSettingsPath } from './helpers/paths.js'
import { fileExists } from './helpers/file-exists.js'
import { readJson, readJsonIfExists, writeJson } from './helpers/json-file.js'

export const initSettings = async () => {
	if (await fileExists(userspaceSettingsPath)) return

	await mkdir(userspaceDirectory, { recursive: true })

	await writeJson(userspaceSettingsPath, {
		parent: 'fennec',
	})
}

export const getSettings = async () => {
	const themeTree = ['userspace']

	const bombsiteObjects = [await readJsonIfExists(userspaceBombsitesPath)]
	const radarObjects = [await readJsonIfExists(userspaceRadarsPath)]
	const settingsObjects = [await readJson(userspaceSettingsPath)]

	while (settingsObjects[settingsObjects.length - 1].parent) {
		themeTree.push(settingsObjects[settingsObjects.length - 1].parent)

		settingsObjects.push(
			await readJson(`${themesDirectory}/${settingsObjects[settingsObjects.length - 1].parent}/theme.json`),
		)

		bombsiteObjects.push(
			await readJsonIfExists(`${themesDirectory}/${settingsObjects[settingsObjects.length - 1].parent}/bombsites.json`),
		)

		radarObjects.push(
			await readJsonIfExists(`${themesDirectory}/${settingsObjects[settingsObjects.length - 1].parent}/radars.json`),
		)
	}

	return {
		themeTree,

		bombsites: merge({}, ...bombsiteObjects.reverse()),
		radars: merge({}, ...radarObjects.reverse()),
		settings: merge({}, ...settingsObjects.reverse()),
	}
}

export const getThemeTree = async (firstTheme = 'userspace') => {
	const themeTree = [firstTheme]

	// make sure we don't end up in this loop forever
	for (let i = 0; i < 16; i++) {
		let settingsObject = await readJson(`${themesDirectory}/${themeTree[themeTree.length - 1]}/theme.json`)
		if (! settingsObject?.parent) return themeTree

		themeTree.push(settingsObject.parent)
	}

	return themeTree
}
