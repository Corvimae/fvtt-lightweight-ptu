import { handleChangeInputDelta } from "../utils/sheetUtils.js";

export default class MoveSheet extends ItemSheet {
  constructor(...args) {
    super(...args);
  }

  static get defaultOptions() {
    return mergeObject(
      super.defaultOptions,
      {
        classes: ["ptu", "sheet", "item", "move"],
        width: 600,
        height: 350,
      },
    );
  }

  get template() {
    return 'systems/fvtt-lightweight-ptu/templates/sheets/items/move.html';
  }

  getData() {        
    return {
      editable: this.isEditable,
      owner: this.entity.owner,
      item: this.item,
      data: {
        ...this.item.data.data,
        derived: {
          moveTypeName: this.item.data.data.type[0].toUpperCase() + this.item.data.data.type.slice(1),
          damageTypeName: this.item.data.data.attackType[0].toUpperCase() + this.item.data.data.attackType.slice(1),
        }
      },
    };
  }

  activateListeners(html) {
    if (this.isEditable) {
      const handleNumericChangeEvent = event => handleChangeInputDelta(this.item.data, event);

      html.find('input[data-dtype="Number"]').change(handleNumericChangeEvent);
    }

    super.activateListeners(html);
  }
}