'use strict'

module.exports = {
     /*
  |--------------------------------------------------------------------------
  | Session Secret
  |--------------------------------------------------------------------------
  |
  | The session secret is used to create session tokens. Please do not share this code.
  |
  */
  secret: "AddSecretHere",
  

  /*
  |--------------------------------------------------------------------------
  | Cookie Name
  |--------------------------------------------------------------------------
  |
  | The name of the cookie to be used for saving session id. Session ids
  | are signed and encrypted.
  |
  */
  cookieName: 'session',

  /*
  |--------------------------------------------------------------------------
  | Clear session when browser closes
  |--------------------------------------------------------------------------
  |
  | If this value is true, the session cookie will be temporary and will be
  | removed when browser closes.
  |
  */
  clearWithBrowser: true,

  /*
  |--------------------------------------------------------------------------
  | Session age
  |--------------------------------------------------------------------------
  |
  | This value is only used when `clearWithBrowser` is set to false. The
  | age must be a valid https://npmjs.org/package/ms string or should
  | be in milliseconds.
  |
  | Valid values are:
  |  '2h', '10d', '5y', '2.5 hrs'
  |
  */
  age: '2h',
  
  // start options

  domain: undefined,
  encode : undefined,
  maxAge: 60 * 60 * 24 * 7 ,
  expires : undefined ,
  secure:false,

  /*
  |--------------------------------------------------------------------------
  | Cookie options
  |--------------------------------------------------------------------------
  |
  | Cookie options defines the options to be used for setting up session
  | cookie
  |
  */
  httpOnly: true,
  sameSite: false,
  path: '/'
};