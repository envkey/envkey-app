import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

export default function(props){

  const
    renderVerifyEmailCodeSubmit = ()=>{
      if (props.isVerifyingEmailCode){
        return h(Spinner)
      } else {
        const label = props.emailVerificationType == "sign_in" ? "Sign In" : "Submit"
        return h.button(label)
      }
    },


    renderVerifyEmailCodeError = ()=>{
      const codeName = props.emailVerificationType == "sign_in" ? "Sign In Code" : "Sign Up Code"
      if (props.verifyEmailCodeError || props.authError){
        return h.p(".error", [`Oops! We couldn't verify your email. Check your internet connection, confirm you have the right ${codeName}, and try again. If it's still not working, contact support: support@envkey.com`])
      }
    }

  return h.div(".verify-email-code", [

    h.div(".msg", [
      h.p(props.copy),
    ]),

    renderVerifyEmailCodeError(),

    h.form({onSubmit: props.onVerifyEmailCode}, [

      h.fieldset([
        h.input({
          type: "password",
          placeholder: `Your ${codeName} Code`,
          required: true,
          value: props.emailVerificationCode,
          onChange: props.onInputChange
        })
      ]),

      h.fieldset([
        renderVerifyEmailCodeSubmit()
      ])
    ])

  ])

}