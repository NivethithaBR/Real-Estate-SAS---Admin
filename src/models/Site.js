const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema(
  {
    site_name: {
      type: String,
      required: true,
      trim: true,
    },
    survey_no: {
      type: String,
      // required: true,
      trim: true,
    },
    mobile_no: {
      type: String,
      // required: true,
      trim: true,
    },
    address: {
      type: String,
      // required: true,
      trim: true,
    },
    location: {
      type: String,
      // required: true,
      trim: true,
    },
    state: {
      type: String,
      // required: true,
      trim: true,
    },
    city: {
      type: String,
      // required: true,
      trim: true,
    },
    site_incharge_name: {
      type: String,
      // required: true,
      trim: true,
    },

    site_map_image: {
      public_id: { type: String },
      url: { type: String },
    },
    site_banner: {
      public_id: { type: String },
      url: { type: String },
    },
    site_card_image: {
      public_id: { type: String },
      url: { type: String },
    },
    attachment: {
      public_id: String,
      url: String,
    },
    plots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plot",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

siteSchema.methods.setImageSize = function (imageUrl, width, height) {
  if (imageUrl) {
    return imageUrl.replace(/upload\/(.*)\/v/, `upload/w_${width},h${height}/v`);
  }
  return null;
};

module.exports = mongoose.model("Site", siteSchema);
