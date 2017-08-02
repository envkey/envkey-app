import React from 'react'
import R from 'ramda'
import EnvEntryCell from './env_cell/env_entry_cell'
import EnvValCell from './env_cell/env_val_cell'
import LockedEntryCell from './env_cell/locked_entry_cell'
import LockedValCell from './env_cell/locked_val_cell'

import h from "lib/ui/hyperscript_with_helpers"

export default class EntryRow extends React.Component {

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
          socketUserRemovingName = [removingFirstName, removingLastName].join(" "),
          productionLocked = Boolean(R.path(["production", entryKey, "locked"], envsWithMeta)),
          hasProductionMetaOnly = Boolean(R.path(["productionMetaOnly", entryKey], envsWithMeta)),
          entryEditable = (!productionLocked || (productionLocked && !hasProductionMetaOnly)),
          entryCellClass = entryEditable ? EnvEntryCell : LockedEntryCell

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
        h(entryCellClass, {
          ...this.props,
          val: entryKey.toUpperCase(),
          isUpdating: this.props.isUpdatingEntryFn(entryKey),
          isEditing: editing.entryKey === entryKey && !editing.environment
        })
      ]),

      h.div(".val-cols", [
        environments.map((environment,i)=>{
          const envEntry = envsWithMeta[environment][entryKey],
                valCellClass = envEntry.locked ? LockedValCell : EnvValCell

          return h.div(".val-col", {key: i}, [
            h(valCellClass, {
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

