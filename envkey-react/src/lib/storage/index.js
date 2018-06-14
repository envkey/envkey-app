import R from 'ramda'

let storageState = {}

export const

  configStorageAdapter = {
    put(k, v, cb) {
      if(!R.equals(v, storageState[k])){
        window.configStore.set(k,v)
        storageState[k] = v
      }
      cb(null)
    },
    get(k, cb) {
      let v = window.configStore.get(k)
      storageState[k] = v
      cb(null, v)
    },
    del(k, cb) {
      window.configStore.delete(k)
      delete storageState[k]
      cb(null)
    }
  }