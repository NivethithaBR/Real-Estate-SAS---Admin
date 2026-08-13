const mongoose = require("mongoose");

const Metapage = new mongoose.Schema(
  {
    userId : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Metatokens",
      required : true
    },
    userPageData : {
        type : String
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Metapages", Metapage);
