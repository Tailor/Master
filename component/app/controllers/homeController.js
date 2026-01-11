const master = require('mastercontroller');

class homeController {

    constructor(requestObject) {
        // Constructor is called for every request
        this.requestObject = requestObject;

        // Before/After action filters
        // this.beforeAction(["edit", "update"], function(obj) {
        //     // Check authentication
        //     if (!isAuthenticated(obj)) {
        //         obj.response.statusCode = 401;
        //         obj.response.end('Unauthorized');
        //         return;
        //     }
        //     this.next();
        // });
    }

    index(obj) {
        // Render component view
        this.render('index', {
            title: 'Component Home',
            message: 'This is a component view'
        });

        // Access component-specific services
        // const data = this.componentService.getData();

        // Access route parameters (casing preserved!)
        // const itemId = obj.params.itemId;

        // Access shared state
        // const user = obj.state.user;
    }

    // Example actions
    // show(obj) {
    //     const id = obj.params.id;
    //     this.render('show', { id });
    // }

    // create(obj) {
    //     const data = obj.params.formData;
    //     // Save data...
    //     this.redirect('/component');
    // }
}

module.exports = homeController;
