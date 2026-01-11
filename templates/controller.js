const master = require('mastercontroller');

class AddControllerNameHereController {

    constructor(requestObject) {
        // Constructor is called for every request
        this.requestObject = requestObject;

        // ===========================
        // BEFORE/AFTER ACTION FILTERS
        // ===========================

        // Run before specific actions
        // this.beforeAction(["edit", "update", "destroy"], function(obj) {
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
        //     console.log('Record saved successfully');
        // });
    }

    // ===========================
    // RESTFUL ACTIONS
    // ===========================

    // GET /<resource>
    async index(obj) {
        // Fetch all records
        // const items = this.db.query('SELECT * FROM items');

        this.render('index', {
            title: 'Index',
            items: []
        });
    }

    // GET /<resource>/:id
    async show(obj) {
        const id = obj.params.id; // Parameter casing preserved!

        // Fetch single record
        // const item = this.db.query('SELECT * FROM items WHERE id = ?', [id]);

        this.render('show', {
            title: 'Show',
            id: id
        });
    }

    // GET /<resource>/new
    async new(obj) {
        this.render('new', {
            title: 'New Record'
        });
    }

    // GET /<resource>/:id/edit
    async edit(obj) {
        const id = obj.params.id;

        // Fetch record for editing
        // const item = this.db.query('SELECT * FROM items WHERE id = ?', [id]);

        this.render('edit', {
            title: 'Edit',
            id: id
        });
    }

    // POST /<resource>
    async create(obj) {
        const formData = obj.params.formData;

        // Save new record
        // const result = this.db.query('INSERT INTO items SET ?', formData);

        // Redirect to index
        this.redirect('/AddControllerNameHere');
    }

    // PUT /<resource>/:id
    async update(obj) {
        const id = obj.params.id;
        const formData = obj.params.formData;

        // Update record
        // const result = this.db.query('UPDATE items SET ? WHERE id = ?', [formData, id]);

        // Redirect to show page
        this.redirect(`/AddControllerNameHere/${id}`);
    }

    // DELETE /<resource>/:id
    async destroy(obj) {
        const id = obj.params.id;

        // Delete record
        // const result = this.db.query('DELETE FROM items WHERE id = ?', [id]);

        // Redirect to index
        this.redirect('/AddControllerNameHere');
    }

    // ===========================
    // HELPER METHODS
    // ===========================

    // Access request data
    // - Route parameters: obj.params.id, obj.params.itemId (casing preserved!)
    // - Query string: obj.params.query.search
    // - Form data: obj.params.formData.email
    // - Files: obj.params.formData.files.avatar
    // - Request method: obj.type ('get', 'post', 'put', 'delete')
    // - Full request: obj.request
    // - Full response: obj.response

    // Access services (DI)
    // - Singleton: this.db.query()
    // - Scoped: this.logger.log()
    // - Transient: this.email.send()

    // Render methods
    // - this.render('view', data) - Render view with layout
    // - this.renderComponent('component', 'view', data) - Render component view
    // - this.json(data) - Send JSON response
    // - this.redirect(path) - Redirect to path
}

module.exports = AddControllerNameHereController;
