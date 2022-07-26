import {
	App,
	MarkdownPostProcessorContext,
	Plugin,
	PluginSettingTab,
	Setting,
	moment,
} from "obsidian";

interface ObsidianCountdownSettings {
	dateFormat: string;
}

const DEFAULT_SETTINGS: ObsidianCountdownSettings = {
	dateFormat: "DD/MM/YYYY",
};

export default class ObsidianCountdown extends Plugin {
	settings: ObsidianCountdownSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ObsidianCountdownSettingTab(this.app, this));

		this.registerMarkdownPostProcessor(
			countdownMarkdownPostProcessor
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

async function countdownMarkdownPostProcessor(
  el: HTMLElement,
  ctx: MarkdownPostProcessorContext,
) {
  if (!doesContainDate(el.innerText)) return;

	for (let i = 0; i < el.innerText.length; i++) {
		const text = el?.innerText;
		if (!text) continue;
		if (text[i] != ':') continue;

		const date = el.innerText.slice(
			i + 1,
			i + 11
		);

		const diff = moment(date, "DD/MM/YYYY")
			.endOf("day")
			.fromNow()
			.replace("in ", "");

		// NOTE: figure out the way to add highlighting blocks
		// el.innerHTML = el.innerHTML.replace(":" + date + ":", formatDiff(diff));

		if (el?.textContent)
			el.textContent = el.textContent?.replace(
				":" + date + ":",
				diff
			);
	}
}

function formatDiff(diff: string): string {
	const cls = 'countdown-highlight'
	return `<mark class="${cls}">${diff}</mark>`;
}

function doesContainDate(text: string): boolean {
	return (
		null != text.match(/(:[0-9][0-9]\/[0-9][0-9]\/[0-9][0-9][0-9][0-9]:)/)
	);
}

class ObsidianCountdownSettingTab extends PluginSettingTab {
	plugin: ObsidianCountdown;

	constructor(app: App, plugin: ObsidianCountdown) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", {
			text: "Settings for Obsidian-Count-Down.",
		});
		containerEl.createEl("i", {
			text: "If you want to create a date to count up/down to, just place a date into `:` i.e. :01/01/1970:",
		});

		new Setting(containerEl)
			.setName("Date Format")
			.setDesc("The format of the date you will use between the `:`")
			.addText((text) =>
				text
					.setPlaceholder(
						"The format of the date you will use between the `:`"
					)
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dateFormat = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
