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
        herri_elkargoen_koropleta_mapa: {
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
        topoJSON_herri_elkargoak: "topoJSON/herri_elkargoak.topo.json",
        json_izena: "udalerriak-l-bn-z",
        json_izena_herri_elkargoak: "herri_elkargoak",
        koloreak: {
            bai: "#a6ce39",
            ez: "#c4161c",
            lehenetsia: "#ffffff"
        }
    };

    // Kolore-maparen proiekzioaren xehetasunak.
    var kolore_maparen_proiekzioa = d3.geo.mercator()
        .center([aukerak.kolore_mapa.proiekzioa.erdia.lat, aukerak.kolore_mapa.proiekzioa.erdia.lng])
        .scale(aukerak.kolore_mapa.proiekzioa.eskala)
        .translate([aukerak.kolore_mapa.zabalera / 2, aukerak.kolore_mapa.altuera / 2]);

    // Sinbolo proportzionalen maparen proiekzioaren xehetasunak.
    var sinbolo_proportzionalen_maparen_proiekzioa = d3.geo.mercator()
        .center([aukerak.sinbolo_proportzionalen_mapa.proiekzioa.erdia.lat, aukerak.sinbolo_proportzionalen_mapa.proiekzioa.erdia.lng])
        .scale(aukerak.sinbolo_proportzionalen_mapa.proiekzioa.eskala)
        .translate([aukerak.sinbolo_proportzionalen_mapa.zabalera / 2, aukerak.sinbolo_proportzionalen_mapa.altuera / 2]);

    // Herri elkargoen koropleta maparen proiekzioaren xehetasunak.
    var herri_elkargoen_koropleta_maparen_proiekzioa = d3.geo.mercator()
        .center([aukerak.herri_elkargoen_koropleta_mapa.proiekzioa.erdia.lat, aukerak.herri_elkargoen_koropleta_mapa.proiekzioa.erdia.lng])
        .scale(aukerak.herri_elkargoen_koropleta_mapa.proiekzioa.eskala)
        .translate([aukerak.herri_elkargoen_koropleta_mapa.zabalera / 2, aukerak.herri_elkargoen_koropleta_mapa.altuera / 2]);

    // Kolore-maparen bidearen generatzailea.
    var kolore_maparen_bidea = d3.geo.path()
        .projection(kolore_maparen_proiekzioa);

    // Sinbolo proportzionalen maparen bidearen generatzailea.
    var sinbolo_proportzionalen_maparen_bidea = d3.geo.path()
        .projection(sinbolo_proportzionalen_maparen_proiekzioa);

    // Herri elkargoen kolore-maparen bidearen generatzailea.
    var herri_elkargoen_koropleta_maparen_bidea = d3.geo.path()
        .projection(herri_elkargoen_koropleta_maparen_proiekzioa);

    // Maparen svg elementua eskuratu eta neurriak ezarri.
    var svg = d3.select("#mapa svg")
        .attr("width", aukerak.kolore_mapa.zabalera)
        .attr("height", aukerak.kolore_mapa.altuera);

    // Sinbolo proportzionalen maparen svg elementua eskuratu eta neurriak ezarri.
    var sinbolo_proportzionalen_svg = d3.select("#sinbolo-proportzionalen-mapa svg")
        .attr("width", aukerak.sinbolo_proportzionalen_mapa.zabalera)
        .attr("height", aukerak.sinbolo_proportzionalen_mapa.altuera);

    // Herri elkargoen koropleta maparen svg elementua eskuratu eta neurriak ezarri.
    var herri_elkargoen_koropleta_mapa_svg = d3.select("#herri-elkargoen-koropleta-mapa svg")
        .attr("width", aukerak.herri_elkargoen_koropleta_mapa.zabalera)
        .attr("height", aukerak.herri_elkargoen_koropleta_mapa.altuera);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .scale(eskala)
        .html("")
        .direction('s')
        .offset([0, 0]);

    var herriak = {
        alde: 0,
        aurka: 0,
        erabakitzeke: 0,
        ez_daude_deituak: 0,
        guztira: 0
    };

    var biztanleak = {
        alde: 0,
        aurka: 0,
        erabakitzeke: 0,
        ez_daude_deituak: 0,
        guztira: 0
    };

    var herri_elkargoak = {};
    var herrialdeak = {};

    // HELEP emaitzen datuak irakurri dagokion CSVtik.
    d3.csv(aukerak.emaitzakCSV, function(error, emaitzak) {

        if (error) {
            return console.error(error);
        }

        // Datu geografikoak irakurri dagokion topoJSONetik.
        d3.json(aukerak.topoJSON, function(error, geodatuak) {

            if (error) {
                return console.error(error);
            }

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

                        if (!herri_elkargoak[d.herri_elkargoa_2016]) {

                            herri_elkargoak[d.herri_elkargoa_2016] = {
                                herriak: {
                                    alde: 0,
                                    aurka: 0,
                                    erabakitzeke: 0,
                                    ez_daude_deituak: 0
                                },
                                biztanleak: {
                                    alde: 0,
                                    aurka: 0,
                                    erabakitzeke: 0,
                                    ez_daude_deituak: 0
                                }
                            }
                        }

                        if (!herrialdeak[d.herrialdea]) {

                            herrialdeak[d.herrialdea] = {
                                herriak: {
                                    alde: 0,
                                    aurka: 0,
                                    erabakitzeke: 0,
                                    ez_daude_deituak: 0
                                },
                                biztanleak: {
                                    alde: 0,
                                    aurka: 0,
                                    erabakitzeke: 0,
                                    ez_daude_deituak: 0
                                }
                            }
                        }

                        if (d.emaitza === "bai") {

                            herriak.alde++;
                            biztanleak.alde = biztanleak.alde + biztanleria2016;
                            herri_elkargoak[d.herri_elkargoa_2016].herriak.alde++;
                            herri_elkargoak[d.herri_elkargoa_2016].biztanleak.alde = herri_elkargoak[d.herri_elkargoa_2016].biztanleak.alde + biztanleria2016;
                            herrialdeak[d.herrialdea].herriak.alde++;
                            herrialdeak[d.herrialdea].biztanleak.alde = herrialdeak[d.herrialdea].biztanleak.alde + biztanleria2016;

                        } else if (d.emaitza === "ez") {

                            herriak.aurka++;
                            biztanleak.aurka = biztanleak.aurka + biztanleria2016;
                            herri_elkargoak[d.herri_elkargoa_2016].herriak.aurka++;
                            herri_elkargoak[d.herri_elkargoa_2016].biztanleak.aurka = herri_elkargoak[d.herri_elkargoa_2016].biztanleak.aurka + biztanleria2016;
                            herrialdeak[d.herrialdea].herriak.aurka++;
                            herrialdeak[d.herrialdea].biztanleak.aurka = herrialdeak[d.herrialdea].biztanleak.aurka + biztanleria2016;

                        } else if (d.emaitza === "ez-dago-deitua") {

                            herriak.ez_daude_deituak++;
                            biztanleak.ez_daude_deituak = biztanleak.ez_daude_deituak + biztanleria2016;
                            herri_elkargoak[d.herri_elkargoa_2016].herriak.ez_daude_deituak++;
                            herri_elkargoak[d.herri_elkargoa_2016].biztanleak.ez_daude_deituak = herri_elkargoak[d.herri_elkargoa_2016].biztanleak.ez_daude_deituak + biztanleria2016;
                            herrialdeak[d.herrialdea].herriak.ez_daude_deituak++;
                            herrialdeak[d.herrialdea].biztanleak.ez_daude_deituak = herrialdeak[d.herrialdea].biztanleak.ez_daude_deituak + biztanleria2016;

                        } else {

                            herriak.erabakitzeke++;
                            biztanleak.erabakitzeke = biztanleak.erabakitzeke + biztanleria2016;
                            herri_elkargoak[d.herri_elkargoa_2016].herriak.erabakitzeke++;
                            herri_elkargoak[d.herri_elkargoa_2016].biztanleak.erabakitzeke = herri_elkargoak[d.herri_elkargoa_2016].biztanleak.erabakitzeke + biztanleria2016;
                            herrialdeak[d.herrialdea].herriak.erabakitzeke++;
                            herrialdeak[d.herrialdea].biztanleak.erabakitzeke = herrialdeak[d.herrialdea].biztanleak.erabakitzeke + biztanleria2016;
                        }

                        biztanleak.guztira = biztanleak.guztira + biztanleria2016;

                        herriak.guztira++;
                    }
                });
            });

            // Aurreko herri elkargoen datuen taula eguneratu.
            for (var herri_elkargoa in herri_elkargoak) {

                var herri_elkargoak_taula = document.getElementById("herri-elkargoak-taula");

                herri_elkargoak_taula.insertAdjacentHTML("beforeend",
                    "<tr>" +
                        "<td>" + herri_elkargoa + "</td>" +
                        "<td>" + herri_elkargoak[herri_elkargoa].herriak.alde + "</td>" +
                        "<td>" + herri_elkargoak[herri_elkargoa].herriak.aurka + "</td>" +
                        "<td>" + herri_elkargoak[herri_elkargoa].herriak.erabakitzeke + "</td>" +
                        "<td>" + herri_elkargoak[herri_elkargoa].herriak.ez_daude_deituak + "</td>" +
                        "<td>" + herri_elkargoak[herri_elkargoa].biztanleak.alde + "</td>" +
                        "<td>" + herri_elkargoak[herri_elkargoa].biztanleak.aurka + "</td>" +
                        "<td>" + herri_elkargoak[herri_elkargoa].biztanleak.erabakitzeke + "</td>" +
                        "<td>" + herri_elkargoak[herri_elkargoa].biztanleak.ez_daude_deituak + "</td>" +
                    "</tr>"
                );
            }

            // Herrialdeen datuen taula eguneratu.
            for (var herrialdea in herrialdeak) {

                var herrialdeak_taula = document.getElementById("herrialdeak-taula");

                herrialdeak_taula.insertAdjacentHTML("beforeend",
                    "<tr>" +
                        "<td>" + herrialdea + "</td>" +
                        "<td>" + herrialdeak[herrialdea].herriak.alde + "</td>" +
                        "<td>" + herrialdeak[herrialdea].herriak.aurka + "</td>" +
                        "<td>" + herrialdeak[herrialdea].herriak.erabakitzeke + "</td>" +
                        "<td>" + herrialdeak[herrialdea].herriak.ez_daude_deituak + "</td>" +
                        "<td>" + herrialdeak[herrialdea].biztanleak.alde + "</td>" +
                        "<td>" + herrialdeak[herrialdea].biztanleak.aurka + "</td>" +
                        "<td>" + herrialdeak[herrialdea].biztanleak.erabakitzeke + "</td>" +
                        "<td>" + herrialdeak[herrialdea].biztanleak.ez_daude_deituak + "</td>" +
                    "</tr>"
                );
            }

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
                        max: biztanleak.guztira - biztanleak.ez_daude_deituak,
                        show: false
                    }
                },
                grid: {
                    y: {
                        lines: [{
                            value: Math.round((biztanleak.guztira - biztanleak.ez_daude_deituak) / 2),
                            text: "Erdiak: " + Math.round((biztanleak.guztira - biztanleak.ez_daude_deituak) / 2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
                            axis: "y",
                            position: "end"
                        }]
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
                        max: herriak.guztira - herriak.ez_daude_deituak,
                        show: false
                    }
                },
                grid: {
                    y: {
                        lines: [{
                            value: Math.round((herriak.guztira - herriak.ez_daude_deituak) / 2),
                            text: "Erdiak: " + Math.round((herriak.guztira - herriak.ez_daude_deituak) / 2),
                            axis: "y",
                            position: "end"
                        }]
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

        marraztuHerriElkargoenMapa();
    });

    function marraztuHerriElkargoenMapa() {

        // Datu geografikoak irakurri dagokion topoJSONetik.
        d3.json(aukerak.topoJSON_herri_elkargoak, function(error, geodatuak) {

            if (error) {
                return console.error(error);
            }

            herri_elkargoen_koropleta_mapa_svg.selectAll(".unitatea")
                .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena_herri_elkargoak]).features)
                .enter().append("path")
                .attr("fill", function(d) {

                    // Herri elkargoko emaitzen arabera koloreztatuko dugu.
                    if (herri_elkargoak[d.properties.IZENA_EU].herriak.ez_daude_deituak > 0)  {

                        return "url('#pattern-stripe')";

                    // Emaitza HELEParen aldekoa bada...
                    } else if (herri_elkargoak[d.properties.IZENA_EU].herriak.alde > herri_elkargoak[d.properties.IZENA_EU].herriak.aurka) {

                        return aukerak.koloreak.bai;

                    // Kontrakoa bada berriz...
                    } else {

                        return aukerak.koloreak.ez;

                    }

                    // Emaitzarik ez badago...
                    return aukerak.koloreak.lehenetsia;

                })
                .attr("class", "unitatea")
                .attr("id", function(d) { return "unitatea_" + d.properties.H_ELK_KODE; })
                .attr("d", herri_elkargoen_koropleta_maparen_bidea)
                .on("mouseover", function(d) {
                    onMouseOver(d);
                })
                .on("mouseout", function(d) {
                    onMouseOut(d);
                })
                .call(tip);

            // Kanpo-mugak (a === b)
            herri_elkargoen_koropleta_mapa_svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena_herri_elkargoak], function(a, b) { return a === b; }))
                .attr("d", herri_elkargoen_koropleta_maparen_bidea)
                .attr("class", "kanpo-mugak");

            // Unitateak aurreko planora ekarri.
            herri_elkargoen_koropleta_mapa_svg.selectAll(".unitatea").each(function() {
                var sel = d3.select(this);
                sel.moveToFront();
            });

            // Eskualdeen arteko mugak (a !== b)
            herri_elkargoen_koropleta_mapa_svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena_herri_elkargoak], function(a, b) { return a !== b; }))
                .attr("d", herri_elkargoen_koropleta_maparen_bidea)
                .attr("class", "eskualde-mugak");
        });
    }
}());
