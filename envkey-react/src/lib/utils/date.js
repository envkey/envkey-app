import moment from 'moment'
import 'moment-twitter'

export const twitterShortTs = (timestamp, includeAgo=true)=>{
  const ts = moment(timestamp).twitterShort(),
        s = ts.match(/[0-9]s/) ? "seconds" : ts
  return s + (includeAgo ? " ago" : "")
}