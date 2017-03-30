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
  }


export const

  AppEnvSlider = props => h(OnboardSlider, {...props, className: "app-env-slider"}, [
    h.div(".slide-0", [
      h.h1([h.em(".orange","Nice."), " You created your first app."]),

      h.p([
        "If you look left, you’ll see that ",
        h.strong(".app-name", props.parent.name),
        " is selected in your new ",
        h.em(".blue", "sidebar.")
      ]),

      h.p([
        "The sidebar lists all the apps and users in your organization. You can also manage your account or sign out by clicking the gear icon. ",
      ]),

      h.div(".small-divider"),

      h.p([
        "Next to the sidebar, you’ll notice several ",
        h.em(".blue", "tabs"),
        ," running vertically down the page: ",
        h.em(".blue.condensed", " Variables,"),
        h.em(".blue.condensed", " Keys,"),
        h.em(".blue.condensed", " Collaborators,"),
        " and ",
        h.em(".blue.condensed", " Settings. "),
        "Let’s start with ",
        h.em(".blue.condensed", "Variables.")
      ]),

      h.p([
        "This is where you set your app’s config variables and their values for each environment. ",
        "Go to the top of the page and try ",
        h.em(".orange", "adding a new variable.")
      ]),
    ]),


    h.div(".slide-1", [
      h.h1(".code", [`${R.path(["lastAddedEntry", "entryKey"], props)}=`, h.em(".orange","ENCRYPTED_AND_SAVED")]),

      h.p([
        "Easy, right? ",
        h.em(".blue", "Editing variables"),
        " is easy too. Just hover over the value you want to edit and click. ",
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
        "You might have noticed that any value you set is masked with a bunch of dots. If you want to reveal your config, uncheck the ",
        h.em(".blue", "mask toggle "),
        "next to your app’s name at the top of the ",
        h.em(".blue.condensed", " Variables "),
        "tab: ",
        h.img(".mask-icon",{src: imagePath("mask-icon-ss.png")})
      ]),

      h.div(".small-divider"),

      h.p([
        "Go ahead and finish inputting your app’s config. When you’re ready to move on, head to the ",
        h.em(".blue.condensed", "Keys"),
        " tab."
      ])
    ])
  ]),

  AppKeysSlider = props => h(OnboardSlider, {...props, className: "app-keys-slider"}, [
    h.div(".slide-0", [

      h.h1([h.em(".orange","Hey!"), " Over here!"]),

      h.p([
        "Welcome to the ",
        h.em(".blue.condensed", " Keys "),
        "tab. This is where you connect the config you just setup to your development environment and your servers."
      ]),

      h.p("Let’s start with your development environment. Go ahead and generate your development key.")

    ]),


    h.div(".slide-1", [

      h.h1(["It turned ", h.em(".blue", " blue!")]),

      h.p("That means a new OpenPGP keypair was generated and your config was encrypted with the public key. "),

      h.p("Go ahead and follow the instructions in the blue box. You’ll have your app securely connected in no time. "),

      h.div(".small-divider"),

      h.p("When you’re done with that, you can connect your servers too. It’s just as easy."),

      h.div(".small-divider"),

      h.p([
        "When you’re done generating keys, head to the ",
        h.em(".blue.condensed","Collaborators"),
        " tab where you can invite the rest of your team to your app."])

    ])
  ]),


  AppCollaboratorsSlider = props => h(OnboardSlider, {...props, className: "app-collaborators-slider"}, [
    h.div(".slide-0", [

      h.h1([h.em(".orange","Last step:"), " securely share your config."]),

      h.p([
        "Now that you've entered your config and generated keys, it's time to ",
        h.em(".blue", "add collaborators " ),
        "so the rest of your team has access, too."
      ]),

      // h.p([
      //   "Gone are the days of sharing config over insecure channels like Slack or email. ",
      //   "When you invite a new user, ",
      //   "no 3rd party (including Envkey) ever sees the plain text."
      // ]),

      // h.div(".small-divider"),

      h.p([
        "Have a look at the ",
        h.em(".blue", " access levels "),
        "described at the top of each column.",
        " When you're ready, ",
        h.em(".orange", " invite a user"),
        " by clicking the ",
        h.em(".blue", " + "),
        "button for the access level you want to grant."
      ])




    ]),


    h.div(".slide-1", [

      h.h1([h.em(".orange","That pretty much covers it."), " Questions?"]),

      h.p([
        "Hopefully you now have a good understanding of how to use Envkey to secure and simplify your team's config.",
        " There's really not much to it! ",
        "If you have questions, please contact Envkey's CEO directly: ",
        h.a(".blue",{href: "mailto:dane@envkey.com"}, "dane@envkey.com"),
      ]),
    ])


  ]),

  AppSettingsSlider = props => h(OnboardSlider, {...props, className: "app-settings-slider"}, [



  ]),

  UserAppsSlider = props => h(OnboardSlider, {...props, className: "user-apps-slider"}, [



  ]),

  UserSettingsSlider = props => h(OnboardSlider, {...props, className: "user-settings-slider"}, [



  ])

