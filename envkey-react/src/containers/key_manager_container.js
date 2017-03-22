import React from 'react'
import { connect } from 'react-redux'
import h from "lib/ui/hyperscript_with_helpers"
import {Link} from "react-router"
import {
  DevKeyManagerContainer,
  AssocManagerContainerFactory
} from 'containers'

const KeyManager = function(props){
  return h(".key-manager", [
    h.section(".development-key-section", [

      h.div(".key-section-head", [
        h.h4(props.app.name),
        h.h2([h.strong("Development"), " Key"]),

        h.p([
          "Use this key to access your config’s development environment on your own machine. For security reasons, you shouldn't share it with anyone else."
          // "To give other users access, add them as ",
          // h(Link, {to: props.router.location.pathname.replace("/keys", "/collaborators")}, " collaborators.")
        ])
      ]),

      h.div(".key-section-content", [
        h(DevKeyManagerContainer, props)
      ])
    ]),

    h.section(".server-keys-section", [
      h.div(".key-section-head", [
        h.h4(props.app.name),
        h.h2([h.strong("Server"), " Keys"]),

        h.p("Use these keys to give servers access to your config. You can reuse a key if you have multiple servers that need the same environment.")

      ]),

      h.div(".key-section-content", [
        h(AssocManagerContainerFactory({parentType: "app", assocType: "server"}), props)
      ])
    ])

  ])

}

export default connect()(KeyManager)

