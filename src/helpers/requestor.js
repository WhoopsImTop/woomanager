
const axios = require('axios')

async function requestor(method, endpoint, params, body, id) {
    try {
        if(method == 'POST') {
            await axios
            .post(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/${endpoint}/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}&${params}`, {
                body: body
            })
            .then(res => {
                return res.data
            })
            .catch((e) => {
                return e
            })
        } else if(method == "PATCH") {
            await axios
            .patch(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/${endpoint}/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}&${params}`, {
                body: body
            })
            .then(res => {
                return res.data
            })
            .catch((e) => {
                return e
            })
        } else if (method == "GET"){
            await axios
            .get(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/${endpoint}/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}&${params}`)
            .then(res => {
                return res.data
            })
            .catch((e) => {
                return e
            })
        } else if(method == "Delete") {
            await axios
            .delete(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/${endpoint}/${id}/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}&${params}`)
            .then(res => {
                return res.data
            })
            .catch((e) => {
                return e
            })
        }
    }
    catch(e) {
        return e
    }
}

export default requestor