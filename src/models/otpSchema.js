const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    user_id:{type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    email:{ type: String, required: function(){return !this.phone}},
    phone:{type: String, required: function(){return !this.email}},
    otp:{type: String, required: true},
    expiresAt:{type: Date, required: true},
    verified:{type:Boolean, default: false}
}, {timestamps:true});

module.exports = mongoose.model('OTP', otpSchema);