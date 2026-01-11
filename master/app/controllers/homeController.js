const master = require('mastercontroller');

class homeController {

    constructor(requestObject) {
        // Constructor is called for every request
        this.requestObject = requestObject;

        // ===========================
        // BEFORE/AFTER ACTION FILTERS
        // ===========================

        // Run before specific actions
        // this.beforeAction(["edit", "update"], function(obj) {
        //     // Check authentication
        //     if (!isAuthenticated(obj)) {
        //         obj.response.statusCode = 401;
        //         obj.response.end('Unauthorized');
        //         return;
        //     }
        //     // Continue to action
        //     this.next();
        // });

        // Run after specific actions
        // this.afterAction(["create", "update"], function(obj) {
        //     console.log('User action completed');
        // });
    }

    // ===========================
    // ACTIONS
    // ===========================

    index(obj) {
        // Render view with data
        this.render('index', {
            title: 'Welcome to MasterController',
            message: 'A lightweight MVC framework for Node.js'
        });

        // ===========================
        // ACCESSING REQUEST DATA
        // ===========================

        // Route parameters (casing preserved!)
        // const userId = obj.params.userId;
        // const periodId = obj.params.periodId;

        // Query string parameters
        // const search = obj.params.query.search;

        // Form data (POST body)
        // const email = obj.params.formData.email;

        // Files (multipart/form-data)
        // const avatar = obj.params.formData.files.avatar;

        // Request method
        // const method = obj.type; // 'get', 'post', 'put', 'delete'

        // Full request/response
        // const req = obj.request;
        // const res = obj.response;

        // ===========================
        // DEPENDENCY INJECTION
        // ===========================

        // Access registered services (singleton, scoped, or transient)
        // const users = this.db.query('SELECT * FROM users');
        // this.logger.log('Fetching users');
        // this.email.send(user.email, 'Subject', 'Body');
    }

    // Example: Show action with parameter
    // show(obj) {
    //     const id = obj.params.id;
    //     this.render('show', { id });
    // }

    // Example: Create action with form data
    // create(obj) {
    //     const data = obj.params.formData;
    //     // Save data...
    //     this.redirect('/home');
    // }

    // Example: JSON response for API
    // api(obj) {
    //     this.json({
    //         success: true,
    //         data: { message: 'API response' }
    //     });
    // }

    // Example: Render component view
    // componentView(obj) {
    //     this.renderComponent('mail', 'inbox', { emails: [] });
    // }
}

module.exports = homeController;
