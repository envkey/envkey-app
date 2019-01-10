import traversty from 'traversty'
import h from "lib/ui/hyperscript_with_helpers"
import {envCellDomId} from "lib/ui"

const EditableCellsParent = CellsParent => class extends CellsParent {

  componentDidMount() {
    if(super.componentDidMount)super.componentDidMount()
    document.body.addEventListener("click", ::this._onBodyClick)
    document.body.addEventListener("keydown", ::this._onKeyDown)
  }

  componentWillUnmount() {
    if(super.componentWillUnmount)super.componentWillUnmount()
    document.body.removeEventListener("click", ::this._onBodyClick)
    document.body.removeEventListener("keydown", ::this._onKeyDown)
  }

  _preventClearEditingSelector(){
    return ".grid-content .cell"
  }

  _onBodyClick(e){
    const
      tg = traversty(e.target),
      cell = (tg.is(".cell") ? tg : tg.closest(".cell")).get(0),
      domId = envCellDomId(this.state.editing)


    if (this.state.editing.entryKey){
      const
        noValNoChange = !this.state.editing.inputVal && !this.state.editing.defaultInputVal,
        noChange = this.state.editing.inputVal == this.state.editing.defaultInputVal,
        isCurrentCell = cell && cell.id == domId

      if (!(noValNoChange || noChange) && !isCurrentCell){
        alert(`You're still editing '${this.state.editing.entryKey.toUpperCase()}'. Use ESCAPE to cancel or ENTER to commit.`)
        e.preventDefault()
        e.stopPropagation()
      } else if(!tg.closest(this._preventClearEditingSelector()).length){
        this._deselect()
      }
    }
  }

  _onKeyDown(e){
    if (e.key == "Escape" && (this.state.editing.entryKey)){
      this._deselect(true)
    }
  }

  _deselect(){
    this._clearEditing()
  }

  _clearEditing(){
    this.setState({editing: {}})
  }
}

export default EditableCellsParent