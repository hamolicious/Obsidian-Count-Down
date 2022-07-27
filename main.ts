import {
	App,
	MarkdownPostProcessorContext,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import moment from "moment";

interface MyPluginSettings {
	dateSplitter: string;
	dateFormat: string;
}

declare global {
	var settings: MyPluginSettings;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	dateSplitter: "/",
	dateFormat: "DD/MM/YYYY",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerMarkdownPostProcessor(async function (
			el: HTMLElement,
			ctx: MarkdownPostProcessorContext
		) {
			countdownMarkdownPostProcessor(el, ctx);
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		global.settings = this.settings;
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

  const date = el.innerText.slice(
    el.innerText.indexOf(":") + 1,
    el.innerText.indexOf(":") + 11
  );

  const diff = moment(date, global.settings.dateFormat)
    .endOf("day")
    .fromNow()
    .replace("in ", "");
  el.innerHTML = el.innerHTML.replace(":" + date + ":", formatDiff(diff));
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

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
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
			.setName("Date Splitter")
			.setDesc(
				"The splitter for dates, for example 01/01/1982, the `/` is the splitter"
			)
			.addText((text) =>
				text
					.setPlaceholder(
						"The splitter for dates, for example 01/01/1982, the `/` is the splitter"
					)
					.setValue(this.plugin.settings.dateSplitter)
					.onChange(async (value) => {
						this.plugin.settings.dateSplitter = value;
						await this.plugin.saveSettings();
					})
			);

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
