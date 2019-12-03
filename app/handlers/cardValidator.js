const CreditCard = require('node-creditcard');

module.exports.cardValidator = (cardData) => {
    const creditcard = new CreditCard(cardData);
    // const resp = creditcard.isValid(); 
    const resp = creditcard.validate();
    return resp;
}