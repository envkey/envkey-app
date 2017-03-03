export const inheritedShallow = ({entryKey, inherits, envsWithMeta})=> envsWithMeta[inherits][entryKey]

export const inheritedDeep = ({entryKey, inherits, envsWithMeta})=>{
  let inherited = inheritedShallow({entryKey, inherits, envsWithMeta})
  while (true){
    if(inherited.inherits){
      inherited = inheritedShallow({entryKey, envsWithMeta, inherits: inherited.inherits})
    } else {
      return inherited
    }
  }
}

export const inheritedVal = (props)=> inheritedDeep(props).val