import React from 'react'

const svgString = `<?xml version="1.0" encoding="utf-8"?>
<svg width='56px'
     height='56px'
     xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 100 100"
     preserveAspectRatio="xMidYMid"
     class="uil-blank">
  <rect x="0"
        y="0"
        width="100"
        height="100"
        fill="none"
        class="bk">
  </rect>
  <g transform="scale(0.55)">
    <circle cx="30" cy="150" r="30" fill="#000">
      <animate attributeName="opacity"
               from="0"
               to="1"
               dur="1.1s"
               begin="0"
               repeatCount="indefinite"
               keyTimes="0;0.5;1"
               values="0;1;1">
      </animate>
    </circle>
    <path d="M90,150h30c0-49.7-40.3-90-90-90v30C63.1,90,90,116.9,90,150z" fill="#000000">
      <animate attributeName="opacity"
               from="0"
               to="1"
               dur="1.1s"
               begin="0.11000000000000001"
               repeatCount="indefinite"
               keyTimes="0;0.5;1"
               values="0;1;1">
      </animate>
    </path>
    <path d="M150,150h30C180,67.2,112.8,0,30,0v30C96.3,30,150,83.7,150,150z" fill="#000000">
      <animate attributeName="opacity"
              from="0"
              to="1"
              dur="1.1s"
              begin="0.22000000000000003"
              repeatCount="indefinite"
              keyTimes="0;0.5;1"
              values="0;1;1">
      </animate>
    </path>
  </g>
</svg>`

export default function (){
  return <span className="broadcast-loader"
               dangerouslySetInnerHTML={{ __html: svgString }} />
}
