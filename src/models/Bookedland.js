const mongoose = require("mongoose");

const bookedlandSchema = new mongoose.Schema(
  {
    client_name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Canceled"]

    },
    contact_no: {
      type: String,
      required: true,
    },
    email_id: {
      type: String,
    },
    address: {
      type: String,
      requried: true,
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
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    },

    follow_update: {
      type: Date,
    },
    registration_date: {
      type: Date,
    },
    registration_cost: {
      type: Number,
    },
    token_advance: Number,
    mrp: {
      type: Number,
      default: 0,
    },
    isMrpModified: Boolean,
    modified_mrp: Number,
    full_payment_type: String,
    pending_amount: {
      type: Number,
      default: 0,
    },
    overAllGivenAmount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
    },
    plot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Landplot",
    },
    site_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
    },
    emi_details: {
      type: [
        {
          amount: Number,
          date: Date,
          payment_type: String,
        },
      ],
      default: [],
    },
    installment_details: {
      type: [
        {
          status: String,
          amount: Number,
          date: Date,
          payment_type: String,
        },
      ],
      default: [],
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookingland",
    },

    team: String,
    professional: String,

    professionalsPercentages: [
      {
        type: {
          type: String,
          required: true,
        },
        percentage: {
          type: Number,
          required: true,
        },
      },
    ],
    commissionPercentage: Number,
  },
  {
    timestamps: true,
  }
);

bookedlandSchema.pre("save", function () {
  let amt = this.token_advance || 0;
  let amountToBeGiven = this.mrp;

  console.log(this.isMrpModified);
  if (this.isMrpModified) {
    amountToBeGiven = this.modified_mrp;
  }
  let total = 0;

  if (this.payment_mode === "EMI") {
    const emiTotal = this.emi_details.reduce((acc, value) => acc + (value.amount || 0), 0);
    total = emiTotal;
  }
  if (this.payment_mode === "Installment") {
    const emiTotal = this.installment_details.reduce((acc, value) => acc + (value.amount || 0), 0);
    total = emiTotal;
  }
  if (this.payment_mode === "Full Payment") {
    this.pending_amount = amountToBeGiven - this.overAllGivenAmount;
  } else {
    this.overAllGivenAmount = total + amt;
    this.pending_amount = amountToBeGiven - this.overAllGivenAmount;
  }
});
module.exports = mongoose.model("Bookedland", bookedlandSchema);
