const { body } = require('express-validator');

const AppointmentValidator = [
    body('followup_date')
    .notEmpty().withMessage('Followup date is required'),
    body('followup_time')
    .notEmpty().withMessage('Followup time is required'),
    body('status')
    .notEmpty().withMessage('Status is required'),
    body('remarks')
    .notEmpty().withMessage('Remarks is required'),
];

module.exports = { AppointmentValidator }