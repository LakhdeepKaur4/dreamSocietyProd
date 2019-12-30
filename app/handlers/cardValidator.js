const CreditCard = require('node-creditcard');

module.exports.cardValidator = (cardData) => {
    const creditcard = new CreditCard(cardData);
    // const resp = creditcard.isValid(); 
    // console.log("type",CreditCard.identify('4111'))
    const resp = creditcard.validate();
    return resp;
}  