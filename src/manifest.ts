import pkg from "../package.json";

const manifest = {
	action: {
		default_icon: {
			32: "icons/icon.png",
			38: "icons/icon.png",
		},
		default_popup: "src/entries/popup/index.html",
	},
	background: {
		service_worker: "src/entries/background/main.ts",
	},
	content_scripts: [
		{
			js: ["src/entries/contentScript/primary/main.tsx"],
			matches: ["<all_urls>"],
		},
	],
	host_permissions: ["*://*/*"],
	icons: {
		48: "icons/icon.png",
		128: "icons/icon.png",
	},
	permissions: ["storage", "activeTab", "scripting"] as chrome.runtime.ManifestV3['permissions'],
};

export function getManifest(): chrome.runtime.ManifestV3 {
	return {
		author: pkg.author,
		description: pkg.description,
		name: "GPT-Translator",
		version: pkg.version,
		manifest_version: 3,
		...manifest,
	};
}