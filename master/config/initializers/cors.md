
    |--------------------------------------------------------------------------
    | Origin
    |--------------------------------------------------------------------------
    |
    | Set a list of origins to be allowed. The value can be one of the following
    |
    | Boolean: true - Allow current request origin
    | Boolean: false - Disallow all
    | String - single string with one origin
    | Array - An array of allowed origins
    

    |--------------------------------------------------------------------------
    | Methods
    |--------------------------------------------------------------------------
    |
    | HTTP methods to be allowed. The value can be one of the following
    | Array - An array of allowed methods
    |

    |--------------------------------------------------------------------------
    | allowedHeaders
    |--------------------------------------------------------------------------
    |
    | List of headers to be allowed via Access-Control-Request-Headers header.
    | The value can be on of the following.
    |
    | Boolean: true - Allow current request headers
    | Boolean: false - Disallow all
    | Array - An array of allowed headers
    | String - single string with one allowed header
    | 


    |--------------------------------------------------------------------------
    | Expose Headers
    |--------------------------------------------------------------------------
    |
    | The Access-Control-Expose-Headers response header allows a server to indicate which 
    | response headers should be made available to scripts running in the browser, in response to a cross-origin request
    |
    | Boolean: false - Disallow all
    | String - single string with one allowed header
    | Array - An array of allowed headers
    |

    |--------------------------------------------------------------------------
    | Credentials
    |--------------------------------------------------------------------------
    |
    | The Access-Control-Allow-Credentials response header tells browsers whether to expose the response to frontend JavaScript code when the request's credentials mode (Request.credentials) is include.
    | When a request's credentials mode (Request.credentials) is include, browsers will only expose the response to frontend JavaScript code if the Access-Control-Allow-Credentials value is true
    |
    | Boolean: true - Expose frontend JavaScript code
    | Boolean: false - Conceal frontend JavaScript code
    |
    
      
    |--------------------------------------------------------------------------
    | MaxAge
    |--------------------------------------------------------------------------
    |
    | Define Access-Control-Allow-Max-Age header It should always be a
    | number.
    |