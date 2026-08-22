const mongoose = require("mongoose");

const landSchema = new mongoose.Schema(
  {
    site_name: {
      type: String,
      required: true,
      trim: true,
    },
    survey_no: {
      type: String,
      trim: true,
    },
    mobile_no: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    site_incharge_name: {
      type: String,
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
    site_card_image: [{
      public_id: { type: String },
      url: { type: String },
    }],
    attachment: {
      public_id: String,
      url: String,
    },
    plots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Landplot",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

landSchema.methods.setImageSize = function (imageUrl, width, height) {
  if (imageUrl) {
    return imageUrl.replace(/upload\/(.*)\/v/, `upload/w_${width},h${height}/v`);
  }
  return null;
};

module.exports = mongoose.model("Land", landSchema);
