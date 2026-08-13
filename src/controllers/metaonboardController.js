const querystring = require("querystring");
const axios = require("axios");
const Metatokens = require("../models/Metatokens")
const Metapages = require("../models/Metapages")
const { fetchPages, subscribePages } = require("../services/metaServices")
exports.loginFunction = async (req, res, next) => {
    try {
        console.log("came inside ")
        const params = querystring.stringify({
            client_id: process.env.META_ID,
            redirect_uri: process.env.META_REDIRECT_URI,
            response_type: "code",
            config_id: process.env.META_BUSINESS_CONFIG_ID
        });

        return res.redirect(
            `https://www.facebook.com/v23.0/dialog/oauth?${params}`
        );

    } catch (error) {
        next(error);
    }
};

exports.callbackFunction = async (req, res, next) => {
    try {

        const {
            code,
            error,
        } = req.query;

        if (error) {
            return res.status(400).json({
                success: false,
                message: error,
                result: ""
            });
        }

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Authorization code missing"
            });
        }

        const tokenResponse = await axios.get(
            "https://graph.facebook.com/v23.0/oauth/access_token",
            {
                params: {
                    client_id: process.env.META_ID,
                    client_secret: process.env.META_SECRET,
                    redirect_uri: process.env.META_REDIRECT_URI,
                    code
                }
            }
        );


        if (tokenResponse?.data?.access_token) {

            const expiresIn = Number(tokenResponse?.data?.expires_in);

            const expiresAt = Number.isFinite(expiresIn) ? new Date(Date.now() + expiresIn * 1000) : null;

            const storeAccess = await Metatokens.findOneAndUpdate(
                { username: "appartments" },
                {
                    $set: {
                        accesstoken: tokenResponse?.data?.access_token,
                        expires_in: expiresAt
                    }
                },
                {
                    upsert: true,
                    new: true
                })

            // Storing the meta app clients page data

            const metaClientPages = await fetchPages(storeAccess?.accesstoken);
            // console.log(metaClientPages, "metaClientPages")

            // 

            // Page store here

            // 

            const storePages = await Metapages.findOneAndUpdate(
                {
                    userId: storeAccess?._id
                },
                {
                    $set: {
                        userPageData: metaClientPages
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );

            // Subscribe page here

            const subscribePage = await subscribePages(storePages?.userPageData)
            console.log("Subscription made ",subscribePage)
            return res.redirect("https://apartment.wizinoa.in/leadManagement")
        }
    } catch (error) {
        next(error);
    }
};

