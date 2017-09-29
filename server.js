'use strict'

/*
Parameters
criteria text that message contains or regex (e.g. "^hi")
typeFilter [optional] Array for multiple values or string for one value. Valid values are direct_message, direct_mention, mention, ambient
callback function - (msg, text, [match1], [match2]...) => {}
*/

const express = require('express')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')

// use `PORT` env var on Beep Boop - default to 3000 locally
var port = process.env.PORT || 3000

var slapp = Slapp({
  // Beep Boop sets the SLACK_VERIFY_TOKEN env var
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context()
})


var HELP_TEXT = `
I will respond to the following messages:
\`help\` - to see this message.
\`hi\` - to demonstrate a conversation that tracks state.
\`thanks\` - to demonstrate a simple response.
\`<type-any-other-text>\` - to demonstrate a random emoticon response, some of the time :wink:.
\`attachment\` - to see a Slack attachment message.
`

//*********************************************
// Setup different handlers for messages
//*********************************************

// response to the user typing "help"
slapp.message('help', ['mention', 'direct_message'], (msg) => {
  msg.say(HELP_TEXT)
})

// "Conversation" flow that tracks state - kicks off when user says hi, hello or hey
slapp
  .message('^(hola|Hola|hey)$', ['direct_mention', 'direct_message'], (msg, text) => {
    msg
      .say(`${text}, Como estas ?`)
      // sends next event from user to this route, passing along state
      .route('how-are-you', { greeting: text })
  })
  .route('how-are-you', (msg, state) => {
    var text = (msg.body.event && msg.body.event.text) || ''

    // user may not have typed text as their next action, ask again and re-route
    if (!text) {
      return msg
        .say("Whoops, Estoy esperando que me indiques algo :)")
        .say('Como estas ?')
        .route('how-are-you', state)
    }

    // add their response to state
    state.status = text

    msg
      .say(`Ok entonces. Cual es tu color favorito?`)
      .route('color', state)
  })
  .route('color', (msg, state) => {
    var text = (msg.body.event && msg.body.event.text) || ''

    // user may not have typed text as their next action, ask again and re-route
    if (!text) {
      return msg
        .say("Estoy esperando que me digas tu coLOR favorito")
        .route('color', state)
    }

    // add their response to state
    state.color = text

    msg
      .say('Gracias por usarme')
      .say(`Esto es lo que me dijiste a lo largo de la conversacion: \`\`\`${JSON.stringify(state)}\`\`\``)
    // At this point, since we don't route anywhere, the "conversation" is over
  })



slapp.action('yesno_callback', 'answer', (msg, value) => {
  msg.respond(msg.body.response_url, `${value} Es una buena eleccion!`)
})


//STK codigo para iniciar el flujo de Choques, accidentes o Clima
slapp.message('^(accidentes|choques|accident)$', ['direct_mention', 'direct_message'], (msg, text) => {
    
    //msg.say(`${text}, how are you?`) //aqui toma una variable y la adjunta a la respuesta
      msg.say(`Quieres Saber los accidentes que tiene AGS el dia de hoy ?`)
      // sends next event from user to this route, passing along state
      .route('respuesta-accidentes', { greeting: text })
  })
 
  .route('respuesta-accidentes', (msg, state) => {
   var mensaje = msg.body.event.text ;
    // user may not have typed text as their next action, ask again and re-route

      //return msg
      if (mensaje == "Si" || mensaje == "si" || mensaje == "No" || mensaje == "yes" || mensaje == "no"){
      if (mensaje == "si") {
        msg.say(`los accidentes han sido muy Desastrosos por la concurrencia de lluvia en los ultimos 3 dias en el estado de aguascalientes Quieres hablar de otro tema en especifico ?`)
        .route('hablar-de-otra-cosa-en-especifico', state)
       } else if(mensaje == "no"){
        msg.say(`Entonces de que quieres hablar ?`)
                .route('hablar-de-otra-cosa-en-especifico', state)

         }else{

            msg.say("No te entendi, Disculpa Soy muy torpe \n Selecciona para entender mejor")
              
            msg.say({
            text: 'Quieres Saber los accidentes que tiene AGS ?',
            attachments: [
              {
                text: 'Quieres Saber los accidentes que tiene AGS ?',
                fallback: 'Quieres Saber los accidentes que tiene AGS ? ',
                callback_id: 'yesno_callback',
                actions: [
                  { name: 'answer', text: 'Si', type: 'button', value: 'si' },
                  { name: 'answer', text: 'No', type: 'button', value: 'no' }
                ]
              }]});
        }
      }
   
  })


  //STK codigo para iniciar el flujo de Choques, accidentes o Clima



// "Conversation" flow that tracks state - kicks off when user says hi, hello or hey
slapp.message('^(clima|ambiente|Clima)$', ['direct_mention', 'direct_message'], (msg, text) => {
    
    //msg.say(`${text}, how are you?`) //aqui toma una variable y la adjunta a la respuesta
      msg.say("Que quieres saber del clima, lo se todo y si no me lo inventare !")
      .route('clima-route',{ greeting: text });
      // sends next event from user to this route, passing along state
  }).route('clima-route', (msg, state) => {

   var mensaje = msg.body.event.text ;
   
        msg.say(`
              HORA     DESC.ATMOSFÉRICA    TEMP.        VIENTO    MEDIO RACHAS LLUVIA    HR  PRESIÓN \n
              15h    Cielos Nubosos  25°   12 km/h     32 km/h 0     mm        47%        1011hPa\n
              16h    Cielos Nubosos  25°   11 km/h     32 km/h 0     mm        46%        1009hPa\n
              17h    Cielos Nubosos  24°   9 km/h      30 km/h 0     mm        50%        1010hPa\n
              18h    Cielos Nubosos  23°   8 km/h      28 km/h 0     mm        58%        1011hPa\n
              20h    Lluvia débil    20°   7 km/h      23 km/h 1.5   mm        75%        1013hPa\n
              23h    Lluvia débil    17°   10 km/h     18 km/h 0.3   mm        92%        1015hPa`)

    msg.say("creo que me pase pero te fue util esta informacion ?")

  }).route('hablar-de-otra-cosa-en-especifico', (msg, state) => {

   var mensaje = msg.body.event.text;

   if (mensaje == "clima") {
        msg.say("Que quieres saber del clima, lo se todo !").route('clima', state);

   }

    if(mensaje == "choques" || mensaje == "accidentes"){

          msg.say("Hablaremos de choques Again ?").route('respuesta-accidentes', { greeting: text })


   }else{

       msg.say("Mis Algoritmos No pueden hablar de " + mensaje + ":/")
   }
        
    })
 .route('clima', (msg, state) => {

   var mensaje = msg.body.event.text ;
   
        msg.say(`
              HORA     DESC.ATMOSFÉRICA    TEMP.        VIENTO    MEDIO RACHAS LLUVIA    HR  PRESIÓN \n
              15h    Cielos Nubosos  25°   12 km/h     32 km/h 0     mm        47%        1011hPa\n
              16h    Cielos Nubosos  25°   11 km/h     32 km/h 0     mm        46%        1009hPa\n
              17h    Cielos Nubosos  24°   9 km/h      30 km/h 0     mm        50%        1010hPa\n
              18h    Cielos Nubosos  23°   8 km/h      28 km/h 0     mm        58%        1011hPa\n
              20h    Lluvia débil    20°   7 km/h      23 km/h 1.5   mm        75%        1013hPa\n
              23h    Lluvia débil    17°   10 km/h     18 km/h 0.3   mm        92%        1015hPa`)

    msg.say("creo que me pase pero te fue util esta informacion ?").route('respuesta-clima-si-no',{ greeting: text });

  })


    .route('respuesta-clima-si-no', (msg, state) => {

   var mensaje = msg.body.event.text ;

   if (mensaje == "no") {
        msg.say("Lo siento!, mis algoritmos de entrenamiento son deficientes por favor busca en: https//www.google.com/")

   }  

 if (mensaje == "si") {
        msg.say("Gracias!, Entonces Este POC sera un exito")
        msg.say("Quieres hablar de accidentes ?")

      .route('respuesta-accidentes', { greeting: text })
   }  

    }

    // add their response to state
  /*  state.color = text

    msg
      .say('Gracias por platicar Conmigo, Ultimamente me siento solo, esta es nuestra platica:')
      .say(`Here's what you've told me so far: \`\`\`${JSON.stringify(state)}\`\`\``)
    // At this point, since we don't route anywhere, the "conversation" is over*/
  )




// Can use a regex as well
slapp.message(/^(thanks|thank you)/i, ['mention', 'direct_message'], (msg) => {
  // You can provide a list of responses, and a random one will be chosen
  // You can also include slack emoji in your responses
  msg.say([
    "You're welcome :smile:",
    'You bet',
    ':+1: Of course',
    'Anytime :sun_with_face: :full_moon_with_face:'
  ])
})

// demonstrate returning an attachment...
slapp.message('attachment', ['mention', 'direct_message'], (msg) => {
  msg.say({
    text: 'Check out this amazing attachment! :confetti_ball: ',
    attachments: [{
      text: 'Slapp is a robust open source library that sits on top of the Slack APIs',
      title: 'Slapp Library - Open Source',
      image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
      title_link: 'https://beepboophq.com/',
      color: '#7CD197'
    }]
  })
})

// Catch-all for any other responses not handled above
slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  // respond only 40% of the time
  if (Math.random() < 0.4) {
    msg.say([':wave:', ':pray:', ':raised_hands:'])
  }
})

// attach Slapp to express server
var server = slapp.attachToExpress(express())

// start http server
server.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on port ${port}`)
})
