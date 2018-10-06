import React from 'react'
import R from 'ramda'
import {
  CREATE_ENTRY,
  UPDATE_ENTRY,
  REMOVE_ENTRY,
  UPDATE_ENTRY_VAL,
  IMPORT_ENVIRONMENT,
  REVERT_ENVIRONMENT,
  ADD_SUB_ENV,
  REMOVE_SUB_ENV,
  RENAME_SUB_ENV
} from 'actions'

const
  renderUpdate = ({val, inherits})=> {
    let content
    if (inherits){
      content = [
        <span>inherit from </span>,
        <em>{inherits}</em>
      ]
    } else {
      let valStr
      if (val === null){
        valStr = "undefined"
      } else if (val === ""){
        valStr = "empty string"
      } else {
        valStr = val
      }

      content = [<em>{valStr}</em>]
    }
    return <span className={"action-update" + (inherits ? " inherits" : "")}>
      {content}
    </span>
  },

  renderImport = parsed => {
    return <div className="import">
      {R.toPairs(parsed).map(renderImportPair)}
    </div>
  },

  renderImportPair = ([k,v])=> {
    return <div className="import-pair">
      <span>{k}: </span>
      <em>{v}</em>
    </div>
  },

  renderRevert = ({versionStr, entryKeys})=>{
    let content
    if (entryKeys && entryKeys.length == 1){
      content = [
        <span>variable </span>,
        <em>{entryKeys[0]}</em>,
        <span> to </span>,
        <em>{versionStr}</em>
      ]
    } else if (entryKeys && entryKeys.length > 1){
      content = [
        <span>variable group </span>,
        <em>{entryKeys.join(", ")}</em>,
        <span> to </span>,
        <em>{versionStr}</em>
      ]
    } else {
      content = [
        <span>environment to </span>,
        <em>{versionStr}</em>
      ]
    }

    return <div className="revert-action">{content}</div>
  }

export default function({type, payload}, subEnvLabelsById){
  let content
  switch(type){
    case CREATE_ENTRY:
      content = [
        <span>Created variable </span>,
        <em>{payload.entryKey}</em>
      ]
      break
    case UPDATE_ENTRY:
      content = [
        <span>Renamed variable </span>,
        <em>{payload.entryKey}</em>,
        <span> to </span>,
        <em>{payload.newKey}</em>
      ]
      break
    case REMOVE_ENTRY:
      content = [
        <span>Deleted variable </span>,
        <em>{payload.entryKey}</em>
      ]
      break
    case UPDATE_ENTRY_VAL:
      content = [
        <span>Set </span>,
        <em>{payload.entryKey}</em>,
        <span> to </span>,
        renderUpdate(payload.update)
      ]
      break
    case IMPORT_ENVIRONMENT:
      content = [
        <span>Imported variables </span>,
        renderImport(payload.parsed)
      ]
      break
    case REVERT_ENVIRONMENT:
      content = [
        <span>Reverted </span>,
        renderRevert(payload)
      ]
      break
    case ADD_SUB_ENV:
      content = [
        <span>Created sub-environment </span>,
        <em>{payload.name}</em>
      ]
      break
    case REMOVE_SUB_ENV:
      content = [
        <span>Deleted sub-environment </span>,
        <em>{subEnvLabelsById[payload.id]}</em>
      ]
      break
    // case RENAME_SUB_ENV:
    //   contents = [
    //     <span>Create sub-environment </span>,
    //     <em>{payload.name}</em>
    //   ]
  }

  return <div className="version-action-display">{content}</div>
}