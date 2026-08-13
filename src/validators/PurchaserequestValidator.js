const { body } = require('express-validator');

const PurchaserequestValidator = [
    body('products')
    .notEmpty()
    .withMessage('Products is required'),
    
];

module.exports = { PurchaserequestValidator }