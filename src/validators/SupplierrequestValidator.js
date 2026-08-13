const { body } = require('express-validator');

const SupplierrequestValidator = [
    body('suppliername')
    .notEmpty()
    .withMessage('Supplier name is required'),
    body('address')
    .notEmpty()
    .withMessage('Address is required'),
    body('contactnumber')
    .notEmpty().withMessage('Contact Number is required'),
    body('remarks')
    .notEmpty().withMessage('Remarks is required'),
];

module.exports = { SupplierrequestValidator }