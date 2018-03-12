
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
  }


