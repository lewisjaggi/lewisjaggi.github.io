var geojson;


function createMap() {
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.light',
        accessToken: 'pk.eyJ1Ijoia3Vyb2thYmUiLCJhIjoiY2szNGsxNDl2MDJ3cTNvbXZucGZibG5oOSJ9.AC23cXaWGHa-venrXcvK5A'
    }).addTo(mymap);


    createColor();
    createInfo();
    createLegend();

}

function createColor() {
    let url_query = `${url}/average`;

    fetch(url_query)
        .then(response => {
            return response.json()
        })
        .then(data => {
            $.getJSON("./data/countries.geojson", function (json) {
                countries_features = json.features;
                tabCountryAverage = setAverageForCountries(data);
                setDataMap(countries_features, tabCountryAverage);
                geojson = L.geoJson(countries_features, {style: style, onEachFeature: onEachFeature});
                layerGroup.addLayer(geojson);
            });
        })
        .catch(err => {
            console.log(err);
        });


}

function createColorVolumeStyle() {
    let form = new FormData();
    form.append("min", min);
    form.append("max", max);
    form.append("style", JSON.stringify(beerstyle));
    let url_query = `${url}/volumestyle`;
    layerGroup.removeLayer(geojson);
    mymap.spin(true, {lines: 13, length: 40});
    fetch(url_query, {method: 'POST', body: form})
        .then(response => {
            return response.json()
        })
        .then(data => {
            mymap.spin(false);

            layerGroup.removeLayer(geojson);
            tabCountryAverage = setAverageForCountries(data);
            setDataMap(countries_features, tabCountryAverage);
            geojson = L.geoJson(countries_features, {style: style, onEachFeature: onEachFeature});
            layerGroup.addLayer(geojson);
            if (currentCountry != null)
                selectCountry(currentCountry);
            document.getElementById("beerStats").innerHTML = "";


        })
        .catch(err => {
            mymap.spin(false);
            console.log(err);
        });
}

function createInfo() {
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

// method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>Beer average</h4>' + (props ?
            '<b>' + props.ADMIN + '</b><br />' + props.average
            : 'Hover over a country');
    };

    info.addTo(mymap);

}

function createLegend() {
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [2.0, 3.0, 3.5, 4.0, 4.5],
            labels = [];

        div.innerHTML += '<i style="background:' + getColor(undefined) + '"></i> No data <br> '
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i].toFixed(1) + (grades[i + 1] ? ' &ndash; ' + grades[i + 1].toFixed(1) + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(mymap);
}


function setAverageForCountries(data) {

    let country_avg = [];
    for (let i = 0; i < data.length; i++) {
        country_avg[data[i].country] = Math.round(data[i].average * 100) / 100;
    }

    updateTopCountries(country_avg);
    return country_avg;
}

function updateTopCountries(countries) {
    // Create items array
    var items = Object.keys(countries).map(function (key) {
        return [key, countries[key]];
    });

    // Sort the array based on the second element
    items.sort(function (first, second) {
        return second[1] - first[1];
    });
    listCurrentCountry = [];
    let content = "";
    for (let i = 0; i < items.length; i++) {
        listCurrentCountry.push(convertIso2ToName(items[i][0]));
        listCurrentCountry = listCurrentCountry.filter(e => e !== undefined);
        content += createCountry({
            rank: i + 1,
            name: convertIso2ToName(items[i][0]),
            average: items[i][1],
            iso: items[i][0]
        });
    }

    document.getElementById("countries").innerHTML = content;


    $(".table-row").click(function () {
        if (currentCountry != null) {
            highlightTab(false,true);
        }
        if (selectedRow != null)
            selectedRow.classList.remove("table-warning")
        this.classList.add("table-warning");
        selectedRow = this;

        getTop10($(this).data("country")).then(beers => {
            currentCountry = $(this).data("country");
            let content = `<h3>Top 10 for ${convertIso2ToName(currentCountry)} :</h3>`;
            let ids = [];
            beers.forEach(beer => {
                addedBeer = createBeer(beer);
                content += addedBeer.content;
                ids.push(addedBeer.id);
            });
            document.getElementById("beers").innerHTML = content;
            ids.forEach(id => document.getElementById(id).addEventListener("click", function () {
                    selectBeer(id);
                }
            ));
        });
    })

}

function setDataMap(countries, country_avg) {

    countries.forEach(element => {
        element.properties.average = country_avg[convertIso3ToIso2(element.properties.ISO_A3)];


    });

}

function getColor(d) {
    return d > 5 ? '#800026' :
        d > 4.5 ? '#BD0026' :
            d > 4 ? '#E31A1C' :
                d > 3.5 ? '#FC4E2A' :
                    d > 3 ? '#FD8D3C' :
                        d > 2 ? '#FEB24C' :
                            'rgba(26,52,0,0.17)';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.average),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function selectCountry(iso2) {
    highlightTab(false,true);

    currentCountry = iso2;
    highlightTab(true,false);

    getTop10(iso2).then(beers => {
        let content = `<h3>Top 10 for ${convertIso2ToName(iso2)} :</h3>`;
        let ids = [];
        beers.forEach(beer => {
            addedBeer = createBeer(beer);
            content += addedBeer.content;
            ids.push(addedBeer.id);
        });

        document.getElementById("beers").innerHTML = content;


        ids.forEach(id => document.getElementById(id).addEventListener("click", function () {
                selectBeer(id);
            }
        ));
    });
}

function selectBeer(id) {
    let content = "";
    getBeerStat(id).then(beerInfo => {
        beerInfo = beerInfo[0];
        content = createBeerStat(beerInfo);
        document.getElementById("beerStats").innerHTML = content;
        var ctx = document.getElementById('beerRadar');
        var myRadarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Look', 'Smell', 'Taste', 'Feel'],
                datasets: [{
                    data: [beerInfo.look != null ? beerInfo.look.toFixed(2) : undefined,
                        beerInfo.smell != null ? beerInfo.smell.toFixed(2) : undefined,
                        beerInfo.taste != null ? beerInfo.taste.toFixed(2) : undefined,
                        beerInfo.feel != null ? beerInfo.feel.toFixed(2) : undefined],
                    backgroundColor: radarChartColor,
                }]
            },
            options: {
                title: {
                    display: true,
                    text: radarChartTitle,
                    fontSize: 24,
                },
                scale: {
                    pointLabels: {fontSize: 30},
                    ticks: {
                        suggestedMin: 1,
                        suggestedMax: 5,
                    }
                },
                legend: {
                    display: false,
                }
            }

        });

        getSimilarBeers(beerInfo.style).then(similarBeers => {

            const found = similarBeers.some(el => el.name === beerInfo.name);
            if (!found)
                similarBeers.push(beerInfo);

            similarBeers.sort((a, b) => b.average - a.average);
            var ctx = document.getElementById('similarBeersBar');
            var barChart = new Chart(ctx, {
                type: 'horizontalBar',
                data: {
                    labels: similarBeers.map(beer => beer.name + ", from " + convertIso2ToName(beer.country)),
                    datasets: [{
                        data: similarBeers.map(beer => beer.average.toFixed(2)),
                        backgroundColor: similarBeers.map(beer => beer.name == beerInfo.name ? selectedBeerColorInBarGraph : similarBeerColorsBarGraph),
                    }],
                },
                options: {
                    title: {
                        display: true,
                        text: similarBeersTitle + " (" + beerInfo.style + ")",
                        fontSize: 24,
                    },
                    legend: {
                        display: false,
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                suggestedMin: 1,
                                suggestedMax: 5,
                                fontSize: 18
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Beer score',
                                fontSize: 18,
                              }
                        }],
                        yAxes: [{
                            ticks: {
                                fontSize: 18
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Beer name',
                                fontSize: 18,
                              }
                        }]
                    }
                }

            });

            getSimilarBeersFull(beerInfo.style).then(similarBeers => {
                const found = similarBeers.some(el => el.name === beerInfo.name);
                if (!found)
                    similarBeers.push(beerInfo);

                similarBeers.sort((a, b) => b.average - a.average);
                let percentageSelectedBeer = 0;
                var ctx = document.getElementById('similarBeersFullBar');
                var barChart = new Chart(ctx, {
                    type: 'horizontalBar',
                    data: {
                        labels: similarBeers.map(beer => {
                            let percentage = (1 - (similarBeers.indexOf(beer) / similarBeers.length)) * 100;
                            if (beer.beer_id == beerInfo.beer_id)
                                percentageSelectedBeer = percentage;
                            return Math.ceil((percentage / 5) * 5) + " %";
                        }),
                        datasets: [{
                            data: similarBeers.map(beer => beer.beer_id == beerInfo.beer_id ? 0 : beer.average.toFixed(2)),
                            // barThickness: 1,
                            backgroundColor: similarBeers.map(beer => beer.beer_id == beerInfo.beer_id ? selectedBeerColorInBarGraphFull : similarBeerColorsBarGraphFull),
                        },
                            {
                                data: similarBeers.map(beer => beer.beer_id == beerInfo.beer_id ? beer.average.toFixed(2) : 0),
                                barThickness: 5,
                                backgroundColor: similarBeers.map(beer => beer.beer_id == beerInfo.beer_id ? selectedBeerColorInBarGraphFull : similarBeerColorsBarGraphFull),
                            }],
                    },
                    options: {
                        title: {
                            display: true,
                            text: similarBeersTitleFull + " (" + beerInfo.style + ") : " + percentageSelectedBeer.toFixed(2) + "%",
                            fontSize: 24,
                        },
                        legend: {
                            display: false,
                        },
                        scales: {
                            xAxes: [{
                                ticks: {
                                    suggestedMin: 1,
                                    suggestedMax: 5,
                                    fontSize: 15,
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Beer score',
                                    fontSize: 18,
                                  }
                            }],
                            yAxes: [{
                                ticks: {
                                    fontSize: 15
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Percentage of beer with a worse rank',
                                    fontSize: 18,
                                  }
                            }]
                        },
                        tooltips: {
                            enabled: false
                        }
                    }

                });
            });

            var element = document.getElementById('beerStats');
            element.scrollIntoView();
        });
    });
}

function getBarThickness(numberElements) {
    return 5;
    // return numberElements > 5000 ? 1 :
    //     numberElements > 2500 ? 2 :
    //         numberElements > 1250 ? 3 : 4

}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: e => selectCountry(convertIso3ToIso2(e.target.feature.properties.ISO_A3)),
    });
}

function highlightTab(focus, remove) {
    $('tr').each(function () {
        if ($(this).data('country') === currentCountry) {
            if (remove) {
                this.classList.remove("table-warning");
            } else {
                this.classList.add("table-warning");
            }
            if (focus) {
                this.scrollIntoView({ behavior: 'smooth'});
            }
            }

        });
    }