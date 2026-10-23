import masterrecord from 'masterrecord';

class InitialCreate extends masterrecord.schema {
    constructor(context){
        super(context);
    }

    async up(table){
        await this.init(table);
        
     await this.createTable(table.User);
    }

    async down(table){
        await this.init(table);
        
    await this.dropTable(table.User);
    }
}
export default InitialCreate;
