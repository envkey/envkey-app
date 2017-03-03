import h from "react-hyperscript"
import R from 'ramda'
const hh = require("hyperscript-helpers")(h)

for (let k of R.keysIn(hh)){
  h[k] = hh[k]
}

export default h