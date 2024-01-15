/**
 * Class representing the 4 lines that move along with the images
 */
 export class LinesController {
	// DOM elements
	DOM = {
		// all the 4 lines (.line)
		lines: null,
	};
	
	/**
	 * Constructor.
	 * @param {Element} DOM_elems - main element (.line)
	 */
	constructor(DOM_elems) {
		this.DOM.lines = DOM_elems;
        this.DOM.linesVertical = this.DOM.lines.filter(line => line.classList.contains('line--v'));
        this.DOM.linesHorizontal = this.DOM.lines.filter(line => line.classList.contains('line--h'));
		this.DOM.titleBoxPreview = this.DOM.lines.filter(line => line.classList.contains('titlebox-preview'));
		this.DOM.detailIcon = this.DOM.lines.filter(line => line.classList.contains('detailIcon'));
		this.DOM.detailBack = this.DOM.lines.filter(line => line.classList.contains('detailBack'));
		this.DOM.detailBoxPreview = this.DOM.lines.filter(line => line.classList.contains('detailbox-preview'));

	}
}
