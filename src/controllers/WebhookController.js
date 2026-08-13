const Metapages = require("../models/Metapages")
const Metatokens = require("../models/Metatokens")
const Enquiry = require("../models/Enquiry")
const Users = require("../models/User")
const {useIo} = require("../socket")
const axios = require("axios");

exports.webhookVerify = async (req, res, next) => {
    try {
        
        const VERIFY_TOKEN = process.env.META_VERIFY;

        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            // console.log(`Verified successfully ~~~~~~~~~~~~~~~~~~~ Here`)
            return res.status(200).send(challenge);
        }
        else {
            return res.status(200).json({
                success: false,
                message: "Cannot verify meta account",
                data: "",
            });
        }




    } catch (error) {
        next(error);
    }
};

const fetchLeadDetails = async (leadgen_id, page_id) => {
    try {
        if (!leadgen_id || !page_id) {
            return null;
        }
        const findUser = await Metatokens.findOne({ username: "appartments" })
        if (!findUser) {
            return null;
        }
        const findPageId = await Metapages.findOne({ userId: findUser?._id });
        if (!findPageId) {
            return null;
        }


        const pageIdPermission = JSON.parse(findPageId?.userPageData)
        let response = "";
        for (const clpage of pageIdPermission) {
            if (clpage?.id != page_id) {
                continue;
            }
            // console.log("LedadgenId",leadgen_id)
            response = await axios.get(
                `https://graph.facebook.com/v23.0/${leadgen_id}`,
                {
                    params: {
                        access_token: clpage?.access_token
                    }
                }
            );
            if (response?.data) {
                // console.log("fetched actual lead", response?.data?.field_data)
                return response?.data;
            } else {
                return null;
            }
        }
        return null;
    } catch (error) {
        console.log("Error : " + error?.message)
        return null;
    }

}

exports.webhookLeadget = async (req, res, next) => {
    try {
        
        const io = useIo()
        // console.log("WEBHOOK HIT");
        res.sendStatus(200);
        const entries = req.body.entry || [];
        for (const entry of entries) {
            // console.log("entry",entry)
            if(entry === null){
                continue;
            }
            for (const change of entry.changes) {

                if (change.field !== "leadgen") {
                    continue;
                }

                const {
                    leadgen_id,
                    form_id,
                    page_id
                } = change.value;
                

                // Fetch lead details here
                const getleadsDatas = await fetchLeadDetails(leadgen_id, page_id);
                const leadDatasss = {};
                let createIt = "";
                if (getleadsDatas !== null) {
                    // console.log("here is the lead", getleadsDatas)
                    for (const stores of getleadsDatas?.field_data) {
                        leadDatasss[stores.name] = stores.values[0] ?? null;
                    }

                    if(Object.keys(leadDatasss).length > 0){
                        let getAllusr= "";
                            getAllusr = await Users.findOne({role : "User"})
                        if(!getAllusr){
                            getAllusr = await Users.findOne({role : "Admin"})
                        }

                        createIt = await Enquiry.create({
                            client_name : leadDatasss['name'],
                            city : leadDatasss['location'],
                            contact_no : leadDatasss['phone_number'],
                            whatsappnumber : leadDatasss['contact_no_or_whatsapp_no.'],
                            email_id : leadDatasss['email'],
                            assigned_to : getAllusr?._id,
                            ismeta : "true",
                            remarks : "Lead From Meta Ads"
                        })
                    }

                    if(createIt){
                        // console.log("socket ")
                            io.emit("meta_lead_enquiry","fetchnew")
                    }

                    return true;

                }else{
                    console.log("No lead data to store")
                    return true;
                }
            }
        }
        return true;

    } catch (error) {
        next(error);
    }
};