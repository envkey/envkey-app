import R from 'ramda'
import yaml from 'js-yaml'

const
  dotenv = src => {
    var obj = {}

    // convert Buffers before splitting into lines and processing
    src.toString().split('\n').forEach(function (line) {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      var keyValueArr = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/)
      // matched?
      if (keyValueArr != null) {
        var key = keyValueArr[1]

        // default undefined or missing values to empty string
        var value = keyValueArr[2] ? keyValueArr[2] : ''

        // expand newlines in quoted values
        var len = value ? value.length : 0
        if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
          value = value.replace(/\\n/gm, '\n')
        }

        // remove any surrounding quotes and extra spaces
        value = value.replace(/(^['"]|['"]$)/g, '').trim()

        obj[key] = value
      }
    })

    return obj
  },

  stringifyValues = obj => R.map(v => (v && typeof(v) != "string") ? JSON.stringify(v) : v, obj)


export const

  parseMultiFormat = txt => {
    // Try json
    if (txt.startsWith("{") && txt.endsWith("}")){
      let parsedJson = null
      try {
        parsedJson = JSON.parse(txt)
      } catch (e){}
      if (parsedJson)return stringifyValues(parsedJson)
    }

    // Try yaml
    let parsedYaml = null
    try {
      parsedYaml = yaml.safeLoad(txt, {schema: yaml.FAILSAFE_SCHEMA})
    } catch (e){}
    if (parsedYaml && typeof(parsedYaml) == "object" && !R.isEmpty(parsedYaml)){
      return stringifyValues(parsedYaml)
    }

    // Try dotenv
    let parsedDotenv
    try {
      parsedDotenv = dotenv(txt)
    } catch (e){}
    if(parsedDotenv && !R.isEmpty(parsedDotenv))return parsedDotenv

    return null
  },

  toYaml = obj => yaml.safeDump(JSON.parse(JSON.stringify(obj)), {schema: yaml.FAILSAFE_SCHEMA}),

  toDotEnv = obj => {
    let s = ""
    for (let k in obj){
      if (!obj[k] && obj[k] != "") continue

      if (s){
        s += "\n"
      }
      s += `${k}=`
      if (obj[k] === ""){
        s += ''
      } else {
        s += `'${obj[k].replace("'", "\\'")}'`
      }
    }
    return s
  }










