module.exports = (sequelize, Sequelize) => {
	const Transactions = sequelize.define('transactions_master', {
		transactionId:{
            type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
        },
        entity:{
            type: Sequelize.STRING
        },
        amount:{
            type: Sequelize.INTEGER
        },
        currency:{
            type: Sequelize.STRING
        },
        status:{
            type: Sequelize.STRING
        },
        invoice_id:{
            type: Sequelize.INTEGER
        },
        international:{
            type: Sequelize.BOOLEAN
        },
        method:{
            type: Sequelize.STRING
        },
        description:{
            type: Sequelize.STRING
        },
        amount_refunded:{
            type: Sequelize.INTEGER
        },
        refund_status:{
            type: Sequelize.STRING
        },
        email:{
            type: Sequelize.STRING
        },
        contact:{
            type: Sequelize.STRING
        },
        fee:{
            type: Sequelize.INTEGER
        },
        tax:{
            type: Sequelize.INTEGER 
        },
        error_code:{
            type: Sequelize.INTEGER 
        },
        error_description:{
            type: Sequelize.INTEGER 
        },
        created_at:{
            type: Sequelize.DATE 
        }
	}, {
		freezeTableName: true
	});

	return Transactions;
}