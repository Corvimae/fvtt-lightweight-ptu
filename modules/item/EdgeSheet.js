import { handleChangeInputDelta } from "../utils/sheetUtils.js";

export default class EdgeSheet extends ItemSheet {
  constructor(...args) {
    super(...args);
  }

  static get defaultOptions() {
    return mergeObject(
      super.defaultOptions,
      {
        classes: ["ptu", "sheet", "item", "edge"],
        width: 600,
        height: 350,
      },
    );
  }

  get template() {
    return 'systems/fvtt-lightweight-ptu/templates/sheets/items/edge.html';
  }

  activateListeners(html) {
    if (this.isEditable) {
      const handleNumericChangeEvent = event => handleChangeInputDelta(this.item.data, event);

      html.find('input[data-dtype="Number"]').change(handleNumericChangeEvent);
    }

    super.activateListeners(html);
  }

  getData() {        
    return {
      editable: this.isEditable,
      owner: this.entity.owner,
      item: this.item,
      data: this.item.data.data,
    };
  }
}