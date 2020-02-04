let myInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
};

function getAverageScore(countryName) {
    return Math.random() * 5;
}


async function getTop10(countryName) {
    let form = new FormData();
    form.append("country",countryName);
    form.append("min", min);
    form.append("max", max);
    form.append("style", JSON.stringify(beerstyle));
    url_query = `${url}/beers`;

    try {
        const response = await fetch(url_query, {method:'POST',body:form});
        const responseData = await response.json();
        return responseData;
    } catch (err) {
        console.error('Error: ', err);
    }
}

async function getBeerStat(beerId)
{
    url_query = `${url}/beerStat?beerId=${beerId}`;

    try {
        const response = await fetch(url_query, myInit);
        const responseData = await response.json();
        return responseData;
    } catch (err) {
        console.error('Error: ', err);
    }
}

async function getSimilarBeers(style)
{
    url_query = `${url}/similarBeers?style=${style}&min=${min}&max=${max}`;

    try {
        const response = await fetch(url_query, myInit);
        const responseData = await response.json();
        return responseData;
    } catch (err) {
        console.error('Error: ', err);
    }
}

async function getSimilarBeersFull(style)
{
    url_query = `${url}/similarBeersFull?style=${style}`;

    try {
        const response = await fetch(url_query, myInit);
        const responseData = await response.json();
        return responseData;
    } catch (err) {
        console.error('Error: ', err);
    }
}

async function getBeersStyle()
{
    url_query = `${url}/style`;

    try {
        const response = await fetch(url_query, myInit);
        const responseData = await response.json();
        return responseData;
    } catch (err) {
        console.error('Error: ', err);
    }
}

async function getBeerByName(search)
{
    url_query = `${url}/searchBeer?search=${search}`;

    try {
        const response = await fetch(url_query, myInit);
        const responseData = await response.json();
        return responseData;
    } catch (err) {
        console.error('Error: ', err);
    }
}
