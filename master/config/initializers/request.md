    |--------------------------------------------------------------------------
    | Request body parsing (multipart/form-data)
    |--------------------------------------------------------------------------
    |
    | Configure how incoming multipart/form-data requests (file uploads) are
    | handled by the server. These settings control the underlying "formidable"
    | parser used by the HTTP layer.
    |
    
    |--------------------------------------------------------------------------
    | disableFormidableMultipartFormData
    |--------------------------------------------------------------------------
    |
    | Enable or disable the built-in multipart/form-data parser.
    |
    | Boolean: true  - Disable parsing; you must handle uploads yourself
    | Boolean: false - Enable parsing via formidable (default)
    |
    
    |--------------------------------------------------------------------------
    | formidable
    |--------------------------------------------------------------------------
    |
    | Options forwarded to the formidable parser when multipart parsing is
    | enabled.
    |
    | multiples
    |   Boolean: true  - Allow multiple files per field
    |   Boolean: false - Only a single file per field
    |
    | keepExtensions
    |   Boolean: true  - Preserve the original file extension on disk
    |   Boolean: false - Use a temporary/derived filename without forcing ext
    |
    | maxFileSize
    |   Number | String - Maximum upload size in bytes. You can express this as
    |   a number or a simple string expression, for example:
    |   "5 * 1024 * 1024" for 5 MB.
    |
    | Notes
    | - If parsing is disabled, all formidable options are ignored.
    | - Ensure your reverse proxy/client also permits the configured size.
    |

