const mongoose = require("mongoose");

const landplotScheme = new mongoose.Schema(
    {
        plot_no: {
            type: String,
            required: true,
            trim: true,
        },
        block: {
            type: String,
            trim: true,
        },
        owner: {
            type: String,
            trim: true,
        },
        dimensions: {
            length: {
                type: String,
            },
            width: {
                type: String,
            },
        },
        total_area: {
            type: Number,
        },
        price_per_sqft: {
            type: Number,
        },
        direct_price: {
            type: Number,
        },
        mrp: {
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
            ref: "Land",
            required: true,
        },
        client_id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        total_cost: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

landplotScheme.pre("save", function (next) {
    this.total_cost = this.total_area * this.price_per_sqft;
    next();
});

module.exports = mongoose.model("Landplot", landplotScheme);
