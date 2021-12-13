import cheerio from 'cheerio';
import axios from 'axios';

async function getProduct(ean) {
    const { data } = await axios.get(`https://www.google.de/search?q=${ean}&tbm=shop`);
    const $ = cheerio.load(data);
    let Array = [];
        $('.i0X6df').each(function(element){
            Array.push({
                "name": $(element).find('.Xjkr3b').text(),
                "price": $(element).find('.a8Pemb.OFFNJ').text().split(",").join(".").split('€').join(""),
                "image": $(element).find('.ArOc1c > img').attr('src')
            });
        });
        console.log(Array)
    return Array[0];
}

export default getProduct;