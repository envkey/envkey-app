import EnvCell from './env_cell'

export default class EntryCell extends EnvCell {

  _classNames(){
    return super._classNames().concat([
      "entry-cell"
    ])
  }

}
