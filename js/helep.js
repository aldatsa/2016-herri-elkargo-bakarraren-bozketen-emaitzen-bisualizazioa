(function() {
    "use strict";

    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    var aukerak = {
        zabalera: 800,
        altuera: 600,
        proiekzioa: {
            erdia: {
                lat: -1.1,
                lng: 43.2
            },
            eskala: 32000
        },
        topoJSON: "topoJSON/udalerriak-lapurdi-behe-nafarroa-zuberoa.json",
        json_izena: "udalerriak-l-bn-z"
    };

    // Maparen svg elementuaren neurriak.
    var width = aukerak.zabalera,
        height = aukerak.altuera;

    // Maparen proiekzioaren xehetasunak.
    var projection = d3.geo.mercator()
        .center([aukerak.proiekzioa.erdia.lat, aukerak.proiekzioa.erdia.lng])
        .scale(aukerak.proiekzioa.eskala)
        .translate([width / 2, height / 2]);

    // Maparen bidearen generatzailea.
    var path = d3.geo.path()
        .projection(projection);

    // Maparen svg elementua eskuratu eta neurriak ezarri.
    var svg = d3.select("#mapa svg")
        .attr("width", width)
        .attr("height", height);

    // Datu geografikoak irakurri dagokion topoJSONetik.
    d3.json(aukerak.topoJSON, function(error, geodatuak) {

        if (error) {
            return console.error(error);
        }
        console.log(geodatuak);

        // Mankomunitate guztiak.
        svg.selectAll(".unitatea")
            .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features)
            .enter().append("path")
            .attr("class", "unitatea")
            .attr("id", function(d) { return "unitatea_" + d.properties.ud_kodea; })
            .attr("d", path);

        // Kanpo-mugak (a === b)
        svg.append("path")
            .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena], function(a, b) { return a === b; }))
            .attr("d", path)
            .attr("class", "kanpo-mugak");

        // Unitateak aurreko planora ekarri.
        svg.selectAll(".unitatea").each(function() {
            var sel = d3.select(this);
            sel.moveToFront();
        });

        // Eskualdeen arteko mugak (a !== b)
        svg.append("path")
            .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena], function(a, b) { return a !== b; }))
            .attr("d", path)
            .attr("class", "eskualde-mugak");

    });
}());
