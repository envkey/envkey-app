import copy from 'copy-to-clipboard'
import isElectron from 'is-electron'

export default function(s, opts={}){
  return isElectron() ? window.copy(s) : copy(s, opts)
}