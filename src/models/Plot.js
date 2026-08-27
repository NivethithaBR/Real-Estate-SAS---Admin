const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema(
  {
    plot_no: {
      type: String,
      required: true,
      // unique: true,
      trim: true,
    },
    flat_no: {
      type: String,
      trim: true,
    },
    block: {
      type: String,
      // required: true,
      trim: true,
    },
    tower_name: {
      type: String,
      trim: true,
    },
    floor_no: {
      type: String,
      trim: true,
    },
    unit_type: {
      type: String,
      enum: ["1BHK", "2BHK", "3BHK", "Villa", ""],
      default: "",
    },
    facing: {
      type: String,
      trim: true,
    },
    carpet_area: {
      type: Number,
    },
    built_up_area: {
      type: Number,
    },
    super_built_up_area: {
      type: Number,
    },
    uds: {
      type: Number,
    },
    price_per_sqft: {
      type: Number,
      // required: true,
    },
    total_price: {
      type: Number,
    },
    floor_rise_charges: {
      type: Number,
      default: 0,
    },
    amenities_charges: {
      type: Number,
      default: 0,
    },
    car_parking_charges: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    final_agreement_value: {
      type: Number,
    },
    room_details: [
      {
        room_type: String,
        count: String,
        size: String,
        notes: String,
      },
    ],
    approval_number: {
      type: String,
      trim: true,
    },
    rera_number: {
      type: String,
      trim: true,
    },
    agreement_document: {
      public_id: { type: String },
      url: { type: String },
    },
    floor_plan: {
      public_id: { type: String },
      url: { type: String },
    },
    owner: {
      type: String,
      // required: true,
      trim: true,
    },
    dimensions: {
      length: {
        type: String,
        // required: true,
      },
      width: {
        type: String,
        // required: true,
      },
    },
    total_area: {
      type: Number,
      // required: true,
    },
    direct_price: {
      type: Number,
      default : 0
    },
    mrp: {
      type: Number,
    },
    discount:{
      type: Number,
    },
    patta_document: {
      public_id: { type: String },
      url: { type: String },
    },
    layout_approval: {
      public_id: { type: String },
      url: { type: String },
    },
    building_approval: {
      public_id: { type: String },
      url: { type: String },
    },
    dtcp_approval: {
      public_id: { type: String },
      url: { type: String },
    },
    images: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],
    cover_image: {
      public_id: { type: String },
      url: { type: String },
    },
    plot_status: {
      type: String,
      enum: ["Available", "Booked", "Sold", "Declined"],
      default: "Available",
    },
    is_initial_booked: {
      type: Boolean,
    },
    plot_cent: {
      type: String,
    },
    road_area: {
      type: String,
    },
    plot_sqft: {
      type: String,
    },
    plot_area: {
      type: String,
    },
    site_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      //ref: 'Booked',
      //required: true
    },
  },
  {
    timestamps: true,
  }
);

plotSchema.pre("save", function (next) {
  if (this.super_built_up_area && this.price_per_sqft) {
    const basePrice = this.super_built_up_area * this.price_per_sqft;
    this.total_price =
      basePrice +
      (this.floor_rise_charges || 0) +
      (this.amenities_charges || 0) +
      (this.car_parking_charges || 0) -
      (this.discount || 0); 

    this.final_agreement_value =
      Number(this.total_price * (this.gst || 0)) / 100 + Number(this.total_price);
  } else if (this.total_area && this.price_per_sqft) {
    this.total_cost = this.total_area * this.price_per_sqft;
  }
  next();
});

// plotSchema.pre("save", function (next) {
//   // Update total_price if super_built_up_area and price_per_sqft are present
//   if (this.super_built_up_area && this.price_per_sqft) {
//     this.total_price =
//       (this.super_built_up_area * this.price_per_sqft) +
//       (this.floor_rise_charges || 0) +
//       (this.amenities_charges || 0) +
//       (this.car_parking_charges || 0);

//     // If GST is a percentage or absolute? Usually GST in real estate is a percentage of agreement value or fixed.
//     // Let's assume the user enters GST amount.
//     this.final_agreement_value = (this.total_price || 0) + (this.gst || 0);
//   } else if (this.total_area && this.price_per_sqft) {
//     // Fallback for old plots
//     this.total_cost = this.total_area * this.price_per_sqft;
//   }
//   next();
// });

//const Plot = mongoose.model('Plot', plotSchema);

module.exports = mongoose.model("Plot", plotSchema);
