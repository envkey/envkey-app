import moment from 'moment'
import 'moment-twitter'

export const twitterShortTs = (timestamp)=>{
  const ts = moment(timestamp).twitterShort(),
        includeAgo = ts.match(/[0-9][smhd]/),
        s = ts.match(/[0-9]s/) ? "seconds" : ts

  return s + (includeAgo ? " ago" : "")
}