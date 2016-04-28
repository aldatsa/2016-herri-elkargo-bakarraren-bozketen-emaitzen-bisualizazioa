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

        return eskala;

    }

    function onMouseOut(d) {

        tip.hide();

    }

    function onMouseOver(d) {

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
                        "<div>Biztanleak: " + d.properties.datuak.biztanleria2016 + "</div>";

            if (d.properties.datuak.emaitza === "bai") {
                katea = katea + "<div>Emaitza: ALDE</div>";
            } else if (d.properties.datuak.emaitza === "ez") {
                katea = katea + "<div>Emaitza: KONTRA</div>";
            } else if (d.properties.datuak.emaitza === "ez-dago-deitua") {
                katea = katea + "<div>EZ DAGO BOZKETARA DEITUA</div>";
            } else {
                katea = katea + "<div>Emaitza: ERABAKITZEKE</div>";
            }

            return katea;

        });

        tip.show(d);
    }

    var eskala = eskalatu();

    var aukerak = {
        kolore_mapa: {
            zabalera: 680,
            altuera: 865,
            proiekzioa: {
                erdia: {
                    lat: -1.22,
                    lng: 43.40
                },
                eskala: 32000
            }
        },
        sinbolo_proportzionalen_mapa: {
            zabalera: 680,
            altuera: 500,
            proiekzioa: {
                erdia: {
                    lat: -1.22,
                    lng: 43.25
                },
                eskala: 32000
            }
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

    // Kolore-maparen proiekzioaren xehetasunak.
    var kolore_maparen_proiektzioa = d3.geo.mercator()
        .center([aukerak.kolore_mapa.proiekzioa.erdia.lat, aukerak.kolore_mapa.proiekzioa.erdia.lng])
        .scale(aukerak.kolore_mapa.proiekzioa.eskala)
        .translate([aukerak.kolore_mapa.zabalera / 2, aukerak.kolore_mapa.altuera / 2]);

    // Sinbolo proportzionalen maparen proiekzioaren xehetasunak.
    var sinbolo_proportzionalen_maparen_proiektzioa = d3.geo.mercator()
        .center([aukerak.sinbolo_proportzionalen_mapa.proiekzioa.erdia.lat, aukerak.sinbolo_proportzionalen_mapa.proiekzioa.erdia.lng])
        .scale(aukerak.sinbolo_proportzionalen_mapa.proiekzioa.eskala)
        .translate([aukerak.sinbolo_proportzionalen_mapa.zabalera / 2, aukerak.sinbolo_proportzionalen_mapa.altuera / 2]);

    // Kolore-maparen bidearen generatzailea.
    var kolore_maparen_bidea = d3.geo.path()
        .projection(kolore_maparen_proiektzioa);

    // Sinbolo proportzionalen maparen bidearen generatzailea.
    var sinbolo_proportzionalen_maparen_bidea = d3.geo.path()
        .projection(sinbolo_proportzionalen_maparen_proiektzioa);

    // Maparen svg elementua eskuratu eta neurriak ezarri.
    var svg = d3.select("#mapa svg")
        .attr("width", aukerak.kolore_mapa.zabalera)
        .attr("height", aukerak.kolore_mapa.altuera);

    // Sinbolo proportzionalen maparen svg elementua eskuratu eta neurriak ezarri.
    var sinbolo_proportzionalen_svg = d3.select("#sinbolo-proportzionalen-mapa svg")
        .attr("width", aukerak.sinbolo_proportzionalen_mapa.zabalera)
        .attr("height", aukerak.sinbolo_proportzionalen_mapa.altuera);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .scale(eskala)
        .html("")
        .direction('s')
        .offset([0, 0]);

    // Lixoze kontutan izan.
    // Biarno da baina HELEPen bozketara deitua dago.
    // Momentuz ez dago mapan.
    var herriak = {
        alde: 0,
        aurka: 0,
        erabakitzeke: 0,
        guztira: 1
    };

    // Lixozeren biztanleak kontutan izan.
    // Biarno da baina HELEPen bozketara deitua dago.
    // Momentuz ez dago mapan.
    var biztanleak = {
        alde: 0,
        aurka: 0,
        erabakitzeke: 0,
        guztira: 139
    };

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

                    var biztanleria2016 = 0;

                    if (d.lurralde_kodea === e.properties.ud_kodea) {

                        biztanleria2016 = parseInt(d.biztanleria2016.replace(/\./g, ''), 10);

                        // Udalerri honetako datuak mapako bere elementuarekin lotu.
                        e.properties.datuak = d;

                        if (e.properties.datuak.emaitza !== "ez-dago-deitua") {

                            if (d.emaitza === "bai") {

                                herriak.alde++;
                                biztanleak.alde = biztanleak.alde + biztanleria2016;

                            } else if (d.emaitza === "ez") {

                                herriak.aurka++;
                                biztanleak.aurka = biztanleak.aurka + biztanleria2016;

                            } else {

                                herriak.erabakitzeke++;
                                biztanleak.erabakitzeke = biztanleak.erabakitzeke + biztanleria2016;

                            }

                            biztanleak.guztira = biztanleak.guztira + biztanleria2016;

                            herriak.guztira++;

                        }
                    }
                });
            });

            console.log(biztanleak.guztira);
            console.log(herriak.guztira);
            // Udal guztiak.
            svg.selectAll(".unitatea")
                .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features)
                .enter().append("path")
                .attr("fill", function(d) {

                    // Udalerriko emaitzen arabera koloreztatuko dugu.
                    if (d.properties.datuak && d.properties.datuak.emaitza) {

                        if (d.properties.datuak.emaitza === "ez-dago-deitua")  {

                            return "url('#pattern-stripe')";

                        // Emaitza HELEParen aldekoa bada...
                        } else if (d.properties.datuak.emaitza === "bai") {

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
                .attr("d", kolore_maparen_bidea)
                .on("mouseover", function(d) {
                    onMouseOver(d);
                })
                .on("mouseout", function(d) {
                    onMouseOut(d);
                })
                .call(tip);

            // Kanpo-mugak (a === b)
            svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena], function(a, b) { return a === b; }))
                .attr("d", kolore_maparen_bidea)
                .attr("class", "kanpo-mugak");

            // Unitateak aurreko planora ekarri.
            svg.selectAll(".unitatea").each(function() {
                var sel = d3.select(this);
                sel.moveToFront();
            });

            // Eskualdeen arteko mugak (a !== b)
            svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena], function(a, b) { return a !== b; }))
                .attr("d", kolore_maparen_bidea)
                .attr("class", "eskualde-mugak");

            // Udal guztiak.
            sinbolo_proportzionalen_svg.selectAll(".unitatea")
                .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features)
                .enter().append("path")
                .attr("fill", function(d) {

                    // Udalerriko emaitzen arabera koloreztatuko dugu.
                    if (d.properties.datuak && d.properties.datuak.emaitza) {

                        if (d.properties.datuak.emaitza === "ez-dago-deitua")  {

                            return "url('#pattern-stripe')";

                        }

                    }

                    // Emaitzarik ez badago...
                    return aukerak.koloreak.lehenetsia;

                })
                .attr("class", "unitatea")
                .attr("id", function(d) { return "sinbolo-proportzionalen-unitatea-" + d.properties.ud_kodea; })
                .attr("d", sinbolo_proportzionalen_maparen_bidea)
                .on("mouseover", function(d) {
                    onMouseOver(d);
                })
                .on("mouseout", function(d) {
                    onMouseOut(d);
                })
                .call(tip);

            // Kanpo-mugak (a === b)
            sinbolo_proportzionalen_svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena], function(a, b) { return a === b; }))
                .attr("d", sinbolo_proportzionalen_maparen_bidea)
                .attr("class", "kanpo-mugak");

            // Unitateak aurreko planora ekarri.
            sinbolo_proportzionalen_svg.selectAll(".unitatea").each(function() {
                var sel = d3.select(this);
                sel.moveToFront();
            });

            // Eskualdeen arteko mugak (a !== b)
            sinbolo_proportzionalen_svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena], function(a, b) { return a !== b; }))
                .attr("d", sinbolo_proportzionalen_maparen_bidea)
                .attr("class", "eskualde-mugak");

            var radius = d3.scale.sqrt()
                .domain([0,
                        d3.max(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features,
                               function(d) {
                                   return parseInt(d.properties.datuak.biztanleria2016.replace(/\./g, ''), 10);
                               }
                        )
                ])
                .range([0, 25]);

            sinbolo_proportzionalen_svg.append("g")
                .attr("class", "zirkulua")
                .selectAll("circle")
                .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features)
                .enter().append("circle")
                .attr("transform", function(d) {
                    return "translate(" + sinbolo_proportzionalen_maparen_bidea.centroid(d) + ")";
                })
                .attr("r", function(d) {

                    // Bozkatu duten udalerriek bakarrik izango dute zirkulua.
                    if (d.properties.datuak && d.properties.datuak.emaitza && d.properties.datuak.emaitza !== "ez-dago-deitua") {

                        return radius(parseInt(d.properties.datuak.biztanleria2016.replace(/\./g, ''), 10));

                    }
                })
                .attr("fill", function(d) {

                    if (d.properties.datuak) {

                        // Emaitza HELEParen aldekoa bada...
                        if (d.properties.datuak.emaitza === "bai") {

                            return aukerak.koloreak.bai;

                        // Kontrakoa bada berriz...
                        } else {

                            return aukerak.koloreak.ez;

                        }

                    }

                    // Daturik ez badago...
                    return "#ffffff";

                })
                .on("mouseover", function(d) {
                    onMouseOver(d);
                })
                .on("mouseout", function(d) {
                    onMouseOut(d);
                });

            var biztanleen_grafikoa = c3.generate({
                bindto: "#biztanleria-grafikoa",
                size: {
                    height: 300,
                    width: 200
                },
                legend: {
                    hide: true
                },
                transition: {
                    duration: 1000
                },
                data: {
                    columns: [
                        ["Alde", biztanleak.alde],
                        ["Aurka", biztanleak.aurka]
                    ],
                    type: "bar",
                    colors: {
                        "Alde": aukerak.koloreak.bai,
                        "Aurka": aukerak.koloreak.ez
                    },
                    labels: {
                        format: {
                            "Alde": function(v, id, i, j) {
                                return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                            },
                            "Aurka": function(v, id, i, j) {
                                return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                            }
                        }
                    }
                },
                axis: {
                    x: {
                        show: false
                    },
                    y: {
                        max: biztanleak.guztira,
                        show: false
                    }
                },
                grid: {
                    y: {
                        lines: [
                            {value: Math.round(biztanleak.guztira / 2), text: "Biztanleen erdiak: " + Math.round(biztanleak.guztira / 2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), axis: "y", position: "start"},
                        ]
                    }
                },
                tooltip: {
                    format: {
                        title: function(d) {
                            return "Biztanleak";
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.5
                    }
                }
            });

            var herrien_grafikoa = c3.generate({
                bindto: "#herriak-grafikoa",
                size: {
                    height: 300,
                    width: 200
                },
                legend: {
                    hide: true
                },
                transition: {
                    duration: 1000
                },
                data: {
                    columns: [
                        ["Alde", herriak.alde],
                        ["Aurka", herriak.aurka]
                    ],
                    type: "bar",
                    colors: {
                        "Alde": aukerak.koloreak.bai,
                        "Aurka": aukerak.koloreak.ez
                    },
                    labels: true
                },
                axis: {
                    x: {
                        show: false
                    },
                    y: {
                        max: herriak.guztira,
                        show: false
                    }
                },
                grid: {
                    y: {
                        lines: [
                            {value: Math.round(herriak.guztira / 2), text: "Herrien erdiak: " + Math.round(herriak.guztira / 2), axis: "y", position: "start"},
                        ]
                    }
                },
                tooltip: {
                    format: {
                        title: function(d) {
                            return "Herriak";
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.5
                    }
                }
            });
        });
    });
}());
