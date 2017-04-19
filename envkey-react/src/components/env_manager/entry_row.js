import React from 'react'
import R from 'ramda'
import EnvEntryCell from './env_cell/env_entry_cell'
import EnvValCell from './env_cell/env_val_cell'

import h from "lib/ui/hyperscript_with_helpers"

export default class EntryRow extends React.Component {

  // shouldComponentUpdate(nextProps, nextState) {
  //   if(nextProps.isRebasingOutdatedEnvs){
  //     return false
  //   }

  //   if(!R.equals(this.props.environments, nextProps.environments)){
  //     return true
  //   }

  //   const environments = this.props.environments
  //   for (let environment of environments){
  //     const currentIsUpdating = this.props.isUpdatingValFn(this.props.entryKey, environment),
  //           nextIsUpdating =  nextProps.isUpdatingValFn(nextProps.entryKey, environment)

  //     if(currentIsUpdating != nextIsUpdating){
  //       return true
  //     }
  //   }

  //   const p = [
  //     "entryKey",
  //     "envsWithMeta",
  //     "environments",
  //     "editing",
  //     "highlightRow",
  //     "socketUserEditingEntry",
  //     "socketUserRemovingEntry",
  //     "socketEditingEntryVal"
  //   ]

  //   return !R.equals(R.pick(p, nextProps), R.pick(p, this.props))
  // }

  render(){
    const {
      entryKey,
      envsWithMeta,
      environments,
      editing,
      highlightRow,
      socketUserEditingEntry,
      socketUserRemovingEntry,
      socketEditingEntryVal
    } = this.props

    const classNames = [
            (highlightRow ? "highlight-row" : ""),
            (socketUserEditingEntry ? "socket-editing-entry" : ""),
            (socketUserRemovingEntry ? "socket-removing-entry" : "")
          ],
          {firstName: editingFirstName, lastName: editingLastName} = (socketUserEditingEntry || {}),
          {firstName: removingFirstName, lastName: removingLastName} = (socketUserRemovingEntry || {}),
          socketUserEditingName = [editingFirstName, editingLastName].join(" "),
          socketUserRemovingName = [removingFirstName, removingLastName].join(" ")

    return h.div(".row.entry-row", { className: classNames.join(" ")}, [
      h.div(".socket-entry-overlay.socket-entry-edit", {
        className: (socketUserEditingEntry ? "show" : "")
      }, [
        h.span(".name", socketUserEditingName),
        h.span(" is renaming "),
        h.span(".entry-key", entryKey),
      ]),

      h.div(".socket-entry-overlay.socket-entry-remove", {
        className: (socketUserRemovingEntry ? "show" : "")
      }, [
        h.span(".name", socketUserRemovingName),
        h.span(" is removing "),
        h.span(".entry-key", entryKey),
      ]),

      h.div(".entry-col",[
        h(EnvEntryCell, {
          ...this.props,
          val: entryKey.toUpperCase(),
          isUpdating: this.props.isUpdatingEntryFn(entryKey),
          isEditing: editing.entryKey === entryKey && !editing.environment
        })
      ]),

      h.div(".val-cols", [
        environments.map((environment,i)=>{
          const envEntry = envsWithMeta[environment][entryKey]
          return h.div(".val-col", {key: i}, [
            h(EnvValCell, {
              ...this.props,
              ...envEntry,  //for 'val' and 'inherits'
              environment,
              isUpdating: this.props.isUpdatingValFn(entryKey, environment),
              isEditing: editing.entryKey === entryKey && editing.environment === environment,
              socketUserEditingEntryVal: R.path([entryKey, environment], socketEditingEntryVal)
            })
          ])
        })
      ])

    ])
  }
}

