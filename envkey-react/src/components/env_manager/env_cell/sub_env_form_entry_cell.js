import R from 'ramda'
import FormEntryCell from './form_entry_cell'
import Autocompletable from './traits/autocompletable'
import {allEntries} from "envkey-client-core/lib/env/query"

export default class SubEnvFormEntryCell extends Autocompletable(FormEntryCell){

  constructor(props){
    super(props)

    this.state = {
      ...this.state,
      hidingAutocomplete: false
    }
  }

  _classNames(){
    return super._classNames().concat([
      (this.state.hidingAutocomplete ? "hiding-autocomplete" : "")
    ])
  }

  _onAutocompleteSelect({val}){
    this.setState({inputVal: val}, ()=> {
      this._commit({val})
      this.props.onAddingEntry()
      this.props.onEditCell()
    })

    this.setState({hidingAutocomplete: true})
    setTimeout(()=> this.setState({hidingAutocomplete: false}), 3000)
  }

  _autocompleteOpts(){
    const entries = allEntries(this.props.fullEnvsWithMeta),
          selectedEntries = allEntries(this.props.envsWithMeta),
          searchStr = this._searchStr(),
          filterFn = val => !searchStr ||
                            !searchStr.trim() ||
                            (val.trim().toLowerCase() != searchStr.trim().toLowerCase() &&
                             val.trim().toLowerCase().indexOf(searchStr.trim().toLowerCase()) == 0)

    return R.pipe(
      R.without(selectedEntries),
      R.filter(filterFn),
      R.map(val => ({val, label: val, className: "entry-opt"}))
    )(entries)
  }

  _propsForAutoCompleteOptions(){
    return {
      ...super._propsForAutoCompleteOptions(),
      noAutoSelect: true
    }
  }
}