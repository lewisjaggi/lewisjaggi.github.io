function createBeer(beer) {
    let id = beer.beer_id;
    const markup = `
    <div class="beer">
    <div class="list-group" id="${id}">
        <a class="list-group-item list-group-item-action pointer">
        <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${beer.name}</h5>
        <small>Brewery : ${beer.brewery == null ? 'Unknown' : beer.brewery}</small>
        </div>
        <p class="beerStyle mb-0">Style : ${beer.style}</p>
        <p class="average mb-0">Note : ${beer.average.toFixed(2)}</p>
        <p class="alcohol mb-0">Alcohol : ${beer.abv == null ? "Unknown" : parseFloat(beer.abv).toFixed(1)}</p>
        </a>
    </div> 
    </div> 
    `;
    return {content: markup, id: id};
}

function createCountry(country) {
    const markup = `   
      <tr class='table-row' data-country='${country.iso}' >
        <td><span class="rank">${country.rank}</span></td>
        <td><span class="countryName">${country.name}</span></td>
        <td><span class="countryAverage">${country.average}</span></td>
      </tr>
    `;
    return markup;
}

function createBeerStat(beerInfo) {
    const markup = `
    <div class="card col-12" >
        <div class="card-body">
            <div class="d-flex w-100 justify-content-between">
                <h2>${beerInfo.name}</h2>
                <h4 class="card-subtitle mb-2 text-muted">from ${beerInfo.brewery == null ? "Unknown brewery" : beerInfo.brewery} ${beerInfo.country == "undifined" ? "" : "in " + convertIso2ToName(beerInfo.country)}</h4>
            </div>
            <h4 class="card-subtitle mb-2 text-muted">Note ${parseFloat(beerInfo.average).toFixed(2)}</h4>
            <h4 class="card-subtitle mb-2 text-muted">Alcohol  ${parseFloat(beerInfo.abv).toFixed(1)}</h4>
            <div id="beerRadarContainer" class="col-sm pt-5">
                <canvas id="beerRadar"></canvas>
            </div>
            <div class="col-sm pt-5">
                <canvas id="similarBeersBar"></canvas>
            </div>
            <div class="col-sm pt-5">
                <canvas id="similarBeersFullBar"></canvas>
            </div>

        </div>
    </div>
    `;
    return markup;
}

function createSlider() {
    var slider = document.getElementById('slider');

    noUiSlider.create(slider, {
        start: [min, max],
        connect: true,
        range: {
            'min': min,
            'max': max
        },
        format: wNumb({
            decimals: 1,
        })


    });

    var alcoholSliderValueElement = document.getElementById('alcoholRange');

    slider.noUiSlider.on('update', function (values) {
        alcoholSliderValueElement.value = values.join('% - ') + "%";

    });

    slider.noUiSlider.on('change', function (values) {
        alcoholSliderValueElement.value = values.join('% - ') + "%";
        min = values[0];
        max = values[1];
        createColorVolumeStyle();
    });


}

function createPicker() {
    getBeersStyle().then(style => {
        var select, i, option;
        select = document.getElementById('multipleSelect');

        for (i = 1; i < style.length; i += 1) {
            beerstyle.push(style[i].style);
            option = document.createElement('option');
            option.value = option.text = style[i].style;
            option.selected = true;
            select.append(option)
        }
        $('[name=duallistbox]').bootstrapDualListbox({
            nonSelectedListLabel: 'Non-selected Style',
            selectedListLabel: 'Selected Style',
            moveOnSelect: false,
        });
    });

    $('[name=duallistbox]').on('change', e => {
        beerstyle = $('[name=duallistbox]').val();
        createColorVolumeStyle();
    });

}

function createSearch() {
    var searchInput = document.getElementById('searchInput');
    searchInput.onkeydown = function () {
        if (this.value.length > 0) {
            getBeerByName(this.value).then(beers => {
                beersName = [];
                for (i = 1; i < beers.length; i += 1) {
                    beersName.push({value: beers[i].beer_id, label: beers[i].name});
                }
                $("#searchInput").autocomplete({
                    source: beersName,
                    select: function (event, ui) {
                        event.preventDefault();
                        if (ui.item) {
                            selectBeer(ui.item.value);
                        }
                    },
                    focus: function (event, ui) {
                        // prevent autocomplete from updating the textbox
                        event.preventDefault();
                        // manually update the textbox
                        $(this).val(ui.item.label);
                    },

                });
            });

        }
    };
}


function createSearchCountry() {
    var searchInput = document.getElementById('searchCountry');
    searchInput.onkeypress = function () {
        $("#searchCountry").autocomplete({
            source: function (req, responseFn) {
                var re = $.ui.autocomplete.escapeRegex(req.term);
                var matcher = new RegExp("^" + re, "i");
                var a = $.grep(listCurrentCountry, function (item, index) {
                    return matcher.test(item);
                });
                responseFn(a);
            },
            select: function (event, ui) {
                event.preventDefault();
                if (ui.item) {
                    selectCountry(convertNameToIso2(ui.item.value));
                }
            },
            focus: function (event, ui) {
                // prevent autocomplete from updating the textbox
                event.preventDefault();
                // manually update the textbox
                $(this).val(ui.item.label);
            },

        });


    };
}



