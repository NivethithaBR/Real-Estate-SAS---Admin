const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    client_name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    contact_no: {
      type: String,
      required: true,
    },
    email_id: {
      type: String,
      required: true,
      unique: true,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    aadhar_card: {
      public_id: String,
      url: String,
    },
    pan_card: {
      public_id: String,
      url: String,
    },
    bank_passbook: {
      public_id: String,
      url: String,
    },
    income_proof: {
      public_id: String,
      url: String,
    },
    loan_approval_letter: {
      public_id: String,
      url: String,
    },
    payment_mode: {
      type: String,
      enum: ["EMI", "Full payment"],
    },
    token_advance: {
      type: Number,
    },
    follow_update: {
      type: Date,
    },
    total_installments: {
      type: Number,
      validate: {
        validator: function (value) {
          return [1, 2, 3, 4].includes(value);
        },
        message: (props) => `${props.value} is not a valid installment count!`,
      },
    },
    registration_date: {
      type: Date,
    },
    registration_cost: {
      type: Number,
    },
    installment_status: {
      type: String,
      enum: ["First Installment", "Second Installment", "Third Installment", "Paid"],
    },
    remarks: {
      type: String,
    },
    settlement_date: {
      type: Date,
    },
    visit_date: {
      type: Date,
    },
    plot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plot",
      //required: true
    },
   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Client", clientSchema);
