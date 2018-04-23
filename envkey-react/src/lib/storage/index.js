import R from 'ramda'

let electronStorageState = {}

export const

  electronStorageAdapter = {
    put(k, v, cb) {
      if(!R.equals(v, electronStorageState[k])){
        window.electronStore.set(k,v)
        electronStorageState[k] = v
      }
      cb(null)
    },
    get(k, cb) {
      let v = window.electronStore.get(k)
      if (!v){
        const s = window.localStorage.getItem(k)
        if (s){
          v = JSON.parse(s)
        }
      }
      electronStorageState[k] = v
      cb(null, v)
    },
    del(k, cb) {
      window.electronStore.delete(k)
      delete electronStorageState[k]
      cb(null)
    }
  }