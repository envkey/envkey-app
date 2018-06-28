import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import EnvGridContent from './env_grid_content'
import LabelRow from './label_row'
import EntryForm from './entry_form'

export default function(props) {
  const
    renderAddVar = ()=>{
      if(!props.isReadOnly &&
         !(props.editingMultilineEnvironment && props.editingMultilineEntryKey)){
        return h(EntryForm, {
          ...props,
          onSubmit: props.createEntryRow
        })
      }
    },

    renderEnvGridContent = ()=>{
      if(!(props.editingMultilineEnvironment && !props.editingMultilineEntryKey)){
        return h(EnvGridContent, props)
      }
    },

    renderMultilineHelp = ()=>{
      if (props.editingMultilineEnvironment){
        return <div className="multiline-help">
          <section>
            <h4>Multi-line Edit Mode  ⟶</h4>

            <h6><em>Esc</em> to cancel</h6>
            <h6><em>Enter</em> to commit</h6>
            <h6><em>Shift</em> + <em>Enter</em> for line break</h6>
          </section>
        </div>
      }
    },

    labelRowProps = {...props}

  if (props.editingMultilineEnvironment){
    labelRowProps.environments = [props.editingMultilineEnvironment]
  }

  return h.div(".grid.env-grid", [
    (props.subEnvId ? null : h(LabelRow, labelRowProps)),
    renderAddVar(),
    renderEnvGridContent(),
    renderMultilineHelp()
  ])
}

