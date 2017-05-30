import moment from 'moment'
import 'moment-twitter'

export const twitterShortTs = (timestamp)=>{
  const ts = moment.utc(timestamp, "YYYY-MM-DD HH:mm:ss").twitterShort(),
        includeAgo = ts.match(/[0-9][smhd]/),
        s = ts.match(/[0-9]s/) ? "seconds" : ts

  return s + (includeAgo ? " ago" : "")
}