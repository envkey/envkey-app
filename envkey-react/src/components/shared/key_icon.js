import React from 'react'

const svgString = `<svg width="55" height="26" viewBox="0 0 55 26" xmlns="http://www.w3.org/2000/svg"><path d="M3.901 3.77c4.916-4.917 12.93-4.874 17.898.095l3 3 23.863.127 5.998 5.998-5.934 5.934-2.999-2.999-2.967 2.967-2.999-2.999-2.967 2.967-2.999-2.999-2.967 2.967-2.999-2.999-5.934 5.934c-4.916 4.916-12.93 4.873-17.898-.096C-.972 16.698-1.015 8.685 3.901 3.77zm11.996 11.995c1.638-1.638 1.624-4.31-.032-5.966-1.656-1.656-4.328-1.67-5.966-.032s-1.624 4.31.032 5.966c1.656 1.656 4.328 1.67 5.966.032z" fill="#4A4A4A" fill-rule="evenodd"/></svg>`

export default function (){
  return <span className="key-icon"
               dangerouslySetInnerHTML={{ __html: svgString }} />
}
