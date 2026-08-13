const axios = require("axios");

exports.fetchPages = async (accessToken) => {

    if (accessToken) {
        const { data } = await axios.get(
            "https://graph.facebook.com/v23.0/me/accounts",
            {
                params: {
                    access_token: accessToken
                }
            }
        );
        // console.log("Fetched pages", JSON.stringify(data?.data))
        return JSON.stringify(data?.data);
    }
}

exports.subscribePages = async (pageData) => {
    let response = "";
    const results = [];
    const pageDatas = JSON.parse(pageData)
    if (pageDatas.length > 0) {
        for (const page of pageDatas) {
            try {
                const response = await axios.post(
                    `https://graph.facebook.com/v23.0/${page.id}/subscribed_apps`,
                    {},
                    {
                        params: {
                            access_token: page.access_token,
                            subscribed_fields: "leadgen"
                        }
                    }
                );
                results.push({
                    pageId: page.id,
                    pageName: page.name,
                    success: true,
                    response: response.data
                });
                // console.log("Lead Id ",results)
            } catch (err) {
                results.push({
                    pageId: page.id,
                    pageName: page.name,
                    success: false,
                    error: err.response?.data || err.message
                });
                console.log("Lead Id error",results)

            }
        }
    }
    return results;
}