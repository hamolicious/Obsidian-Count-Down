import { App, MarkdownPostProcessorContext, Plugin, PluginSettingTab, Setting } from 'obsidian';
import moment from "moment";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	defaultDateSplitter: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	defaultDateSplitter: '/'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerMarkdownPostProcessor(
			this.countdownMarkdownPostProcessor
		);
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	countdownMarkdownPostProcessor(
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext
	) {

		if (!doesContainDate(el.innerText))
			return;

		const date = el.innerText.slice(
			el.innerText.indexOf(":") + 1,
			el.innerText.indexOf(":") + 11
		);

		const diff = moment(date, 'DD/MM/YYYY').endOf('day').fromNow().replace('in ', '');
		el.innerText = el.innerText.replace(':' + date + ':', diff)
	}
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
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl("h2", {
			text: "Settings for Obsidian-Count-Down.",
		});

		new Setting(containerEl)
			.setName("Default date splitter")
			.setDesc(
				"The default splitter for dates, for example 01/01/1982, the `/` is the splitter"
			)
			.addText((text) =>
				text
					.setPlaceholder(
						"The default splitter for dates, for example 01/01/1982, the `/` is the splitter"
					)
					.setValue(this.plugin.settings.defaultDateSplitter)
					.onChange(async (value) => {
						this.plugin.settings.defaultDateSplitter = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
