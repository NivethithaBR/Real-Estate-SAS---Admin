const mongoose = require("mongoose");

const boughtlandSchema = new mongoose.Schema(
  {
    client_name: {
      type: String,
      required: true,
      trim: true,
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
    token_advance: {
      type: Number,
    },
    payment_mode: {
      type: String,
    },
    full_payment_type: String,

    follow_update: {
      type: Date,
    },
    registration_cost: {
      type: Number,
      required: [true, "Registration Cost is Required"],
      validate: {
        validator: (val) => val > 0,
        message: "Regstration Cost must be greater than 0",
      },
    },
    registered_by: String,
    registration_date: {
      type: Date,
      required: [true, "Registration Date is Required"],
    },
    mrp: {
      type: Number,
      default: 0,
      required: true,
    },
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
    settlement_date: {
      type: Date,
    },
    plot_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Landplot",
    },
    site_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Land",
    },
    givenAmountDetails: [
      {
        date: {
          type: Date,
          default: Date.now(),
        },
        amount: Number,
        status: {
          type: String,
          enum: [
            "Token Advance",
            "First Installment",
            "Second Installment",
            "Third Installment",
            "Fourth Installment",
            "Fifth Installment",
            "Paid",
          ],
        },
      },
    ],
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
    registration_id: {
      type: mongoose.Types.ObjectId,
      ref: "Registration",
    },
    commission: Number,
    revenue: Number,
    team: String,
    professional: String,
    commission_distributed: [
      {
        type: {
          type: String,
        },
        percentage: {
          type: Number,
        },
        amount: {
          type: Number,
        },
        amt: {
          type: Number,
        },
        name: {
          type: String,
        },
      },
    ],
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

module.exports = mongoose.model("Boughtland", boughtlandSchema);
