(function() {
    "use strict";

    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    function eskalatu() {

        var jatorrizko_zabalera = 680;
        var zabalera = window.innerWidth;
        var altuera = window.innerHeight;

        var eskala = 1;

        // Pantailaren zabalera maparena baino txikiagoa bada.
        if (zabalera < jatorrizko_zabalera) {

            // Eskala kalkulatu.
            eskala = zabalera / jatorrizko_zabalera - 0.04;

        }

        document.getElementById("kontainerra").style["transform-origin"] = "top left";
        document.getElementById("kontainerra").style.transform = "scale(" + eskala + ")";

    }

    eskalatu();

    var aukerak = {
        zabalera: 680,
        altuera: 580,
        proiekzioa: {
            erdia: {
                lat: -1.22,
                lng: 43.25
            },
            eskala: 34000
        },
        emaitzakCSV: "csv/bizt-osoa-udip-2015-datuak-net.csv",
        topoJSON: "topoJSON/udalerriak-lapurdi-behe-nafarroa-zuberoa.json",
        json_izena: "udalerriak-l-bn-z",
        koloreak: {
            bai: "#b50000",
            ez: "#565656",
            lehenetsia: "#ffffff"
        }
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

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html("")
        .direction('s')
        .offset([0, 0]);

    // HELEP emaitzen datuak irakurri dagokion CSVtik.
    d3.csv(aukerak.emaitzakCSV, function(error, emaitzak) {
        console.log(emaitzak);
        if (error) {
            return console.error(error);
        }

        // Datu geografikoak irakurri dagokion topoJSONetik.
        d3.json(aukerak.topoJSON, function(error, geodatuak) {

            if (error) {
                return console.error(error);
            }
            console.log(geodatuak);

            // Emaitzak eta topoJSON-a bateratzeko ideia hemendik hartu dut, behar bada badago modu hobe bat.
            // http://stackoverflow.com/questions/22994316/how-to-reference-csv-alongside-geojson-for-d3-rollover

            // HELEPeko udalerri bakoitzeko datuak dagokion mapako elementuarekin lotu.
            // d: Emaitzen arrayko udalerri bakoitzaren propietateak biltzen dituen objektua.
            // i: indizea
            emaitzak.forEach(function(d, i) {

                // e: Datu geografikoetako udalerriaren propietateak
                // j: indizea
                topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features.forEach(function(e, j) {

                    if (d.lurralde_kodea === e.properties.ud_kodea) {

                        // Udalerri honetako datuak mapako bere elementuarekin lotu.
                        e.properties.datuak = d;

                    }
                });
            });

            // Mankomunitate guztiak.
            svg.selectAll(".unitatea")
                .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features)
                .enter().append("path")
                .attr("fill", function(d) {

                    // Udalerriko emaitzen arabera koloreztatuko dugu.
                    if (d.properties.datuak && d.properties.datuak.emaitza) {

                        // Emaitza HELEParen aldekoa bada...
                        if (d.properties.datuak.emaitza === "bai") {

                            return aukerak.koloreak.bai;

                        // Kontrakoa bada berriz...
                        } else {

                            return aukerak.koloreak.ez;

                        }

                    }

                    // Emaitzarik ez badago...
                    return aukerak.koloreak.lehenetsia;

                })
                .attr("class", "unitatea")
                .attr("id", function(d) { return "unitatea_" + d.properties.ud_kodea; })
                .attr("d", path)
                .on("mouseover", function(d) {

                    if (["Hendaia", "Biriatu", "Urruña", "Ziburu", "Azkaine", "Getaria"].indexOf(d.properties.datuak.euskarazko_izena) >= 0) {
                        tip.direction("e");
                    } else if (["Larraine", "Urdatx/ Santa-Grazi"].indexOf(d.properties.datuak.euskarazko_izena) >= 0) {
                        tip.direction("n");
                    } else if (["Hauze", "Montori = Berorize", "Atharratze-Sorholüze", "Barkoxe", "Eskiula", "Sohüta", "Mitikile-larrori-Mendibile"].indexOf(d.properties.datuak.euskarazko_izena) >= 0) {
                        tip.direction("w");
                    } else {
                        tip.direction("s");
                    }

                    tip.html(function(d) {

                        var katea = "<div><strong>" + d.properties.datuak.euskarazko_izena + "</strong></div>" +
                                    "<div>Biztanleak: " + d.properties.datuak.biztanleria2015 + "</div>";

                        if (d.properties.datuak.emaitza === "bai") {
                            katea = katea + "<div>Emaitza: ALDE</div>";
                        } else if (d.properties.datuak.emaitza === "ez") {
                            katea = katea + "<div>Emaitza: KONTRA</div>";
                        } else {
                            katea = katea + "<div>Emaitza: ERABAKITZEKE</div>";
                        }

                        return katea;

                    });

                    tip.show(d);

                })
                .on("mouseout", function(d) {

                    tip.hide();

                })
                .call(tip);

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
    });
}());
