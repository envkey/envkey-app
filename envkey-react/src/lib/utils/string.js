import R from 'ramda'
import ipaddr from 'ipaddr.js'

const IP_LIST_SPLIT_REGEX = /[,;\n\r]\s*/

export const

  capitalize = (s)=> s.charAt(0).toUpperCase() + s.slice(1),

  shortNum = n => {
    if (n > 1000) {
      return `${parseFloat((n / 1000).toFixed(1))}k`
    } else if (n > 1000000){
      return `${parseFloat((n / 1000000).toFixed(1))}m`
    } else if (n > 1000000000){
      return `${parseFloat((n / 1000000000).toFixed(1))}b`
    } else {
      return n.toString()
    }
  },

  isMultiline = (s)=>{
    return s.split(/[\r\n]+/).length > 1
  },

  isValidIPString = R.pipe(
    R.split(IP_LIST_SPLIT_REGEX),
    R.all(s => {
      try {
        ipaddr.parseCIDR(s)
        return true
      } catch (err){
        try {
          ipaddr.parse(s)
          return true
        } catch (err){
          return false
        }
      }
    })
  )


