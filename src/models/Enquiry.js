const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
    client_name: String,
    address: String,
    contact_no: String,
    email_id: String,
    state: String,
    city: String,
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    visit_date: Date,
    followup_time: String,
    followup_date: Date,
    status:String,
    remarks: String,
    ismeta : {
        type : String,
        enum : ["true","false"]
    },
    lead_source : {
        type : String,
        required : true
    },
    whatsappnumber : {
        type : String,
    },
    site_id:{type: mongoose.Schema.Types.ObjectId, ref:'Site'},
    plot_id:{type: mongoose.Schema.Types.ObjectId, ref:'Plot'}
},{
    timestamps: true,
});

const Enquiry = mongoose.model('Enquiry', EnquirySchema);
module.exports = Enquiry;