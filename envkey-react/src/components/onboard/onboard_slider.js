import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import {imagePath} from "lib/ui"

const
  OnboardSlider = props =>{
    const {selectedIndex, children, className} = props,
          selectedChild = children[selectedIndex]

    return h.div(".onboard-slider", {className}, [
      selectedChild
    ])
  },

  varAddedSlide = (props, isOwner=false)=> h.div(".slide-1", [
    h.h1(".code", [`${R.path(["lastAddedEntry", "entryKey"], props)}=`, h.em(".orange","ENCRYPTED_AND_SAVED")]),

    h.p([
      "To ",
      h.em(".blue", "edit variables"),
      ", hover over a key or value and click. ",
      "Use the enter key to commit after you’ve made a change, or escape to cancel.",
    ]),

    h.p([
      "You can also ",
      h.em(".blue", "copy"),
      " a value to the clipboard using the ",
      h.img(".edit-icon",{src: imagePath("copy-circle-black.png")}),
      "  or ",
      h.em(".blue","clear "),
      "it using the ",
      h.img(".edit-icon",{src: imagePath("remove-circle-black.png")}),
      ". Both show up when you hover over a value."
    ]),

    h.p([
      "You might have noticed that any value you set is masked. If you want to reveal your config, uncheck the ",
      h.em(".blue", "mask toggle "),
      "next to your app’s name at the top of the ",
      h.em(".blue.condensed", " Variables "),
      "tab: ",
      h.img(".mask-icon",{src: imagePath("mask-icon-ss.png")})
    ]),

    h.div(".small-divider"),

    h.p([
      (isOwner ? "Go ahead and finish inputting your app’s config. " : ""),
      "When you’re done, head to the ",
      h.em(".blue.condensed", "EnvKeys"),
      " tab."
    ])
  ])

export const

  OrgOwnerAppEnvSlider = props => h(OnboardSlider, {...props, className: "app-env-slider"}, [
    h.div(".slide-0", [
      h.h1([h.em(".orange","App created."), " Now add some config."]),

      h.p([
        "If you look left, you’ll see ",
        h.strong(".app-name", props.parent.name),
        " selected in the ",
        h.em(".blue", "sidebar, "),
        ` which lists all of ${props.currentOrg.name}'s apps and users.`
      ]),

      h.div(".small-divider"),

      h.p([
        "Next to the sidebar, you’ll see several vertical tabs: ",
        h.em(".blue.condensed", " Variables,"),
        h.em(".blue.condensed", " EnvKeys,"),
        h.em(".blue.condensed", " Collaborators,"),
        " and ",
        h.em(".blue.condensed", " Settings. "),
        "Let’s start with ",
        h.em(".blue.condensed", "Variables.")
      ]),

      h.p([
        "This is where you set your app’s config variables for each environment. ",
        "Try ",
        h.em(".orange", "adding a new variable."),
        (props.didOnboardImport ? " It's ok if you don't actually need to add one right now—you can delete it right away." : "")
      ]),
    ]),

    varAddedSlide(props, true)
  ]),

  OrgAdminAppEnvSlider = props => h(OnboardSlider, {...props, className: "app-env-slider"}, [
    h.div(".slide-0", [
      h.h1(["Access ", h.em(".orange"," granted.")]),

      h.p([
        "If you look left, you’ll see ",
        h.strong(".app-name", props.parent.name),
        " selected in the ",
        h.em(".blue", "sidebar."),
        ` which lists all of ${props.currentOrg.name}'s apps and users.`
      ]),

      h.div(".small-divider"),

      h.p([
        "Next to the sidebar, you’ll see several vertical tabs: ",
        h.em(".blue.condensed", " Variables,"),
        h.em(".blue.condensed", " EnvKeys,"),
        h.em(".blue.condensed", " Collaborators,"),
        " and ",
        h.em(".blue.condensed", " Settings. "),
        "Let’s start with ",
        h.em(".blue.condensed", "Variables.")
      ]),

      h.p([
        "This is where you set your app’s config variables for each environment. ",
        "Try ",
        h.em(".orange", "adding a new variable."),
        " It's ok if you don't actually need to add one right now—you can delete it right away."
      ]),
    ]),

    varAddedSlide(props)
  ]),

  AppAdminAppEnvSlider = props => h(OnboardSlider, {...props, className: "app-env-slider"}, [
    h.div(".slide-0", [
      h.h1(["Access ", h.em(".orange"," granted.")]),

      h.p([
        "If you look left, you’ll see ",
        h.strong(".app-name", props.parent.name),
        " selected in the ",
        h.em(".blue", "sidebar,"),
        ` which lists all the apps you've been given access to.`
      ]),

      h.div(".small-divider"),

      h.p([
        "Next to the sidebar, you’ll see several vertical tabs: ",
        h.em(".blue.condensed", " Variables,"),
        h.em(".blue.condensed", " EnvKeys,"),
        h.em(".blue.condensed", " Collaborators,"),
        " and ",
        h.em(".blue.condensed", " Settings. "),
        "Let’s start with ",
        h.em(".blue.condensed", "Variables.")
      ]),

      h.p([
        "This is where you set your app’s config variables for each environment. ",
        "Try ",
        h.em(".orange", "adding a new variable."),
        " It's ok if you don't actually need to add one right now—you can delete it right away."
      ]),
    ]),

    varAddedSlide(props)
  ]),

  NonAdminAppEnvSlider = props => h(OnboardSlider, {...props, className: "app-env-slider"}, [
    h.div(".slide-0", [
      h.h1(["Access ", h.em(".orange"," granted.")]),

      h.p([
        "If you look left, you’ll see ",
        h.strong(".app-name", props.parent.name),
        " selected in the ",
        h.em(".blue", "sidebar, "),

      ]),

      h.p([
        "The sidebar lists the apps you've been granted access to. You can also manage your account or sign out by clicking the gear icon. ",
      ]),

      h.div(".small-divider"),

      h.p([
        "Next to the sidebar, you’ll notice a ",
        h.em(".blue", "vertical tab bar"),
        ," with a couple of tabs: ",
        h.em(".blue.condensed", " Variables"),
        " and ",
        h.em(".blue.condensed", " EnvKeys. "),
        "Let’s start with ",
        h.em(".blue.condensed", "Variables.")
      ]),

      h.p([
        "This is where you set your app’s config variables for each environment. ",
        "Try ",
        h.em(".orange", "adding a new variable."),
      ]),

      h.p([
        "It's ok if you don't actually need to add one now—you can delete it right away."
      ])
    ]),

    varAddedSlide(props)
  ]),

  AdminAppKeysSlider = props => h(OnboardSlider, {...props, className: "app-keys-slider"}, [
    h.div(".slide-0", [

      h.h1([h.em(".orange","Hey!"), " Over here!"]),

      h.p([
        "Welcome to the ",
        h.em(".blue.condensed", " EnvKeys "),
        "tab. This is where you connect the config you just setup to your development environment and your servers."
      ]),

      h.p("Let’s start with your development environment. Go ahead and generate your development key.")

    ]),

    h.div(".slide-1", [

      h.h1(["It turned ", h.em(".blue", " blue...")]),

      h.p("That means a new OpenPGP keypair was generated and your config was encrypted with the public key. "),

      h.p("Follow the instructions in the blue box to give yourself development access. "),

      h.div(".small-divider"),

      h.p("When you’re done with that, you can give servers access too."),

      h.div(".small-divider"),

      h.p([
        "When you’re done generating keys, head to the ",
        h.em(".blue.condensed","Collaborators"),
        " tab where you can invite the rest of your team to your app."
      ])
    ])
  ]),

  ProdAccessAppKeysSlider = props => h(OnboardSlider, {...props, className: "app-keys-slider"}, [
    h.div(".slide-0", [

      h.h1([h.em(".orange","Hey!"), " Over here!"]),

      h.p([
        "Welcome to the ",
        h.em(".blue.condensed", " EnvKeys "),
        "tab. This is where you connect the config you just setup to your development environment and your servers."
      ]),

      h.p("Let’s start with your development environment. Go ahead and generate your development key.")

    ]),

    h.div(".slide-1", [

      h.h1(["It turned ", h.em(".blue", " blue!")]),

      h.p("That means a new OpenPGP keypair was generated and your config was encrypted with the public key. "),

      h.p("Follow the instructions in the blue box to give yourself development access. "),

      h.div(".small-divider"),

      h.p("When you’re done with that, you can give servers access too.")

    ])
  ]),

  DevAccessAppKeysSlider = props => h(OnboardSlider, {...props, className: "app-keys-slider"}, [
    h.div(".slide-0", [

      h.h1([h.em(".orange","Hey!"), " Over here!"]),

      h.p([
        "Welcome to the ",
        h.em(".blue.condensed", " EnvKeys "),
        "tab. This is where you connect the config you just setup to your development environment.",
        h.p("Let’s start with your development environment. Go ahead and generate your development key.")
      ])
    ]),

    h.div(".slide-1", [

      h.h1(["It turned ", h.em(".blue", " blue!")]),

      h.p("That means a new OpenPGP keypair was generated and your config was encrypted with the public key. "),

      h.p("Follow the instructions in the blue box to give yourself development access. "),

    ])
  ]),

  AppCollaboratorsSlider = props => h(OnboardSlider, {...props, className: "app-collaborators-slider"}, [
    h.div(".slide-0", [

      h.h1([h.em(".orange","Last step:"), " securely share your config."]),

      h.p([
        "Now it's time to ",
        h.em(".blue", "invite collaborators " ),
        "and give the rest of your team access."
      ]),

      h.p([
        "Have a look at the ",
        h.em(".blue", " access levels "),
        "at the top of each column.",
        " To ",
        h.em(".orange", " invite a user"),
        ", click the ",
        h.em(".blue", " + "),
        "button for the permissions you want to grant."
      ])
    ]),

    h.div(".slide-1", [

      h.h1([h.em(".orange","That pretty much covers it."), " Questions?"]),

      h.p([
        "Hopefully you now have a good understanding of how to use EnvKey to secure and simplify your team's config.",
        " If you have questions, feedback, or run into problems, please either email us -- ",
        h.a(".blue",{href: "mailto:support@envkey.com"}, "support@envkey.com"),
        " -- or post an issue on ",
        h.a(".blue",{href: "https://github.com/envkey/envkey-ui/issues"}, "Github"),
        "."
      ])
    ])

  ])

