import XLSX from "xlsx";

class SubscriptionsExcelOutput {
	constructor(cacheQuoteSubscriptions, excelConfig, options) {
		const self = this;
		self._cacheQuoteSubscriptions = cacheQuoteSubscriptions;
		self._excelConfig = excelConfig;
		self._options = options;

		for(let columnConfig of this._excelConfig.columns) {
			this.outputWorkbookSafe();
		}

		cacheQuoteSubscriptions.on('data', () => {
			this.outputWorkbookSafe();
		})
	}

	outputWorkbookSafe() {
		const self = this;

		if(self._excelConfig.hasOwnProperty('debounce') && typeof self._excelConfig.debounce === 'number') {
			if(!this.hasOwnProperty('_lastOutput') || (new Date() - self._lastOutput) > self._excelConfig.debounce)
				this.outputWorkbook();
			else if(!self.hasOwnProperty('_outputTimeout')) {
				self._outputTimeout = setTimeout(() => {
					delete self._outputTimeout;
					self.outputWorkbook();
				}, self._excelConfig.debounce)
			}
		}
		else
			self.outputWorkbook();
	}

	outputWorkbook() {
		this._lastOutput = new Date();

		try {
			const xlsWorkbook = XLSX.utils.book_new();
			const xlsWorksheetName = (typeof this._excelConfig.worksheet === 'string') ? this._excelConfig.worksheet : "Sheet 1";
			//const xlsWorksheetData = [];

			const excelSheetOptions = {};

			const columnKeys = [];
			if(this._excelConfig.hasOwnProperty('columns') && Array.isArray(this._excelConfig.columns)) {
				for(let columnConfig of this._excelConfig.columns) {
					columnKeys.push((typeof columnConfig === 'object' && columnConfig !== null && columnConfig.hasOwnProperty('key')) ? columnConfig.key : columnConfig);
				}
				excelSheetOptions.header = columnKeys;
			}

			const subscriptionValues = this._cacheQuoteSubscriptions.values.map((subscriptionValue) => {
				return (this._excelConfig.hasOwnProperty('columns') && Array.isArray(this._excelConfig.columns))
					? SubscriptionsExcelOutput.filterObject(subscriptionValue, columnKeys)
					: subscriptionValue;
			});

			excelSheetOptions.skipHeader = (this._excelConfig.hasOwnProperty('skipHeader') && this._excelConfig.skipHeader);

			const xlsWorksheet = XLSX.utils.json_to_sheet(subscriptionValues, excelSheetOptions);

			if(this._excelConfig.hasOwnProperty('columns') && Array.isArray(this._excelConfig.columns) && !excelSheetOptions.skipHeader) {
				let cellX = 'A';
				for(let columnConfig of this._excelConfig.columns) {
					if((typeof columnConfig === 'object' && columnConfig !== null && columnConfig.hasOwnProperty('name')))
						xlsWorksheet[`${cellX}1`].v = columnConfig.name;
					cellX = String.fromCharCode(cellX.charCodeAt(0) + 1);
				}
			}

			XLSX.utils.book_append_sheet(xlsWorkbook, xlsWorksheet, xlsWorksheetName);

			XLSX.writeFile(xlsWorkbook, this._excelConfig.workbook);

			this.debug("Outputting workbook", this._excelConfig.workbook);
		}
		catch(error) {
			this.debug("Error outputting workbook", error);
			this.outputWorkbookSafe();
		}

	}

	static filterObject(raw, allowed) {
		return Object.keys(raw)
			.filter(key => allowed.includes(key))
			.reduce((obj, key) => {
				obj[key] = raw[key];
				return obj;
			}, {});
	}

	debug() {
		if(typeof this._options.debug === "function")
			this._options.debug.apply(this, Array.prototype.slice.call(arguments));
		else if(this._options.debug)
			console.log.apply(console, Array.prototype.slice.call(arguments));
	}
}

export default SubscriptionsExcelOutput;
