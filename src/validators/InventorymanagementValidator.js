const { body } = require('express-validator');

const InventorymanagementValidator = [
    body('stock')
    .notEmpty()
    .withMessage('Stock name is required'),
    body('transaction_type')
    .notEmpty()
    .withMessage('Transaction type is required'),
    body('quantity')
    .notEmpty()
    .withMessage('Quantity is required'),
    
    // body('unit')
    // .notEmpty().withMessage('Units is required'),
    // body('category')
    // .notEmpty().withMessage('Category is required'),
    // body('transaction_type')
    // .notEmpty().withMessage('Transaction type is required'),
    // body('remarks')
    // .notEmpty().withMessage('Remarks is required'),
];

module.exports = { InventorymanagementValidator }