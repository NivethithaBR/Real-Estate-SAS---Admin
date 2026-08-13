const { body } = require('express-validator');

const PurchaserequestValidator = [
    body('stock')
    .notEmpty()
    .withMessage('Stock name is required'),
    body('quantity')
    .notEmpty()
    .withMessage('Quantity is required'),
    body('unit')
    .notEmpty().withMessage('Units is required'),
    body('remarks')
    .notEmpty().withMessage('Remarks is required'),
    body('status')
    .notEmpty().withMessage('Status is required')
];

module.exports = { PurchaserequestValidator }