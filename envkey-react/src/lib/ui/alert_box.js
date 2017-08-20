
export const alertBox = (msg, title, cb)=>{
  if (window.nativeAlert){
    window.nativeAlert(msg, title, cb)
  } else {
    alert(msg)
    if(cb)cb()
  }
}