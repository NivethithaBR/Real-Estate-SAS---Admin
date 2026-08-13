const { body } = require('express-validator');

const InventoryadjustmentValidator = [
    body('stock')
    .notEmpty()
    .withMessage('Stock name is required'),
    body('quantity')
    .notEmpty()
    .withMessage('Quantity is required'),
    body('adjustment_type')
    .notEmpty().withMessage('Adjustment type is required'),
    
];

module.exports = { InventoryadjustmentValidator }