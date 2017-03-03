import traversty from 'traversty'
import h from "lib/ui/hyperscript_with_helpers"

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

  _onBodyClick(e){
    const tg = traversty(e.target)
    if ((this.state.editing.entryKey) && !tg.closest(".cell").length)this._clearEditing()
  }

  _onKeyDown(e){
    if (e.key == "Escape" && (this.state.editing.entryKey))this._clearEditing()
  }

  _clearEditing(){
    this.setState({editing: {}})
  }
}

export default EditableCellsParent