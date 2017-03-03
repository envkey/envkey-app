
const FormCell = Cell => class extends Cell {

  _commit(arg){
    super._commit(arg)
    this.props.onCommit(arg)
  }

  _onInputChange(e){
    super._onInputChange(e)
    if(this.props.onChange)this.props.onChange(this._transformInputVal(e.target.value))
  }

}

export default FormCell