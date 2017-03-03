import EnvCell from './env_cell'

export default class EditableEntryCell extends EnvCell {

  _classNames(){
    return super._classNames().concat([
      "entry-cell"
    ])
  }

}
