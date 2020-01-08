import {app, dialog} from "electron";
import fs from "fs";
import GraphQLExcelSubscriber from "./src/GraphQLExcelSubscriber";

export default (appOptions) => {

	app.once('ready', () => {

		const configFileNames = appOptions.hasOwnProperty('config') ?
			[appOptions.config] :
			dialog.showOpenDialogSync({
				title: "Open Configuration",
				message: "Open Configuration",
				openFile: true,
				filters: [
					{ name: 'JSON Config', extensions: ['json'] }
				]
			});

		if(Array.isArray(configFileNames)) {
			const configs = [];
			for(let configFileName of configFileNames) {

				if(!fs.existsSync(configFileName)) {
					dialog.showErrorBox("Missing Configuration File", `"${configFileName}" not found.`);
					app.quit();
				}
				else {
					try {
						const config = JSON.parse(fs.readFileSync(configFileName));

						if(!config.hasOwnProperty('serverURL')) {
							dialog.showErrorBox("Missing serverURL property in Configuration File", `"${configFileName}".`);
							app.quit();
						}

						if(!config.hasOwnProperty('outputWorkbook')) {
							dialog.showErrorBox("Missing outputWorkbook property in Configuration File", `"${configFileName}".`);
							app.quit();
						}

						if(!config.hasOwnProperty('subscriptions') || !Array.isArray(config.subscriptions)) {
							dialog.showErrorBox("Missing subscriptions array in Configuration File", `"${configFileName}" not found.`);
							app.quit();
						}

						configs.push(config);
					}
					catch(error) {
						dialog.showErrorBox("Configuration File Parse Error", `"${configFileName}" could not be parsed.`);
						app.quit();
					}
				}
			}

			for(let config of configs) {
				new GraphQLExcelSubscriber(config, {
					debug: debug
				})
			}
		}
	});

	function debug() {
		if(appOptions.debug)
			console.log.apply(console, [(new Date()).toISOString()].concat(Array.prototype.slice.call(arguments)));
	}
}
