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

    function onMouseOver(d, zein_mapa) {

        // Udalerrien mapek d.properties.datuak daukate, herri elkargoarenak ez.
        if (d.properties.datuak) {
            if (["Hendaia", "Biriatu", "Urruña", "Ziburu", "Azkaine", "Getaria"].indexOf(d.properties.datuak.euskarazko_izena) >= 0) {
                tip.direction("e");
            } else if (["Larraine", "Urdatx/ Santa-Grazi"].indexOf(d.properties.datuak.euskarazko_izena) >= 0) {
                tip.direction("n");
            } else if (["Hauze", "Montori = Berorize", "Atharratze-Sorholüze", "Barkoxe", "Eskiula", "Sohüta", "Mitikile-larrori-Mendibile"].indexOf(d.properties.datuak.euskarazko_izena) >= 0) {
                tip.direction("w");
            } else {
                tip.direction("s");
            }
        } else {

            if (zein_mapa === "elkargoen-koropleta-mapa") {

                if (["Hego Lapurdiko Hirigunea", "Euskal Kostaldea - Aturri hirigunea", "Errobi herri elkargoa"].indexOf(d.properties.IZENA_EU) >= 0) {
                    tip.direction("e");
                } else {
                    tip.direction("s");
                }

            } else if (zein_mapa === "elkargoen-sinbolo-proportzionalen-mapa") {

                if (["Xiberoa herri alkargoa", "Oloroealdeko herri elkargoa"].indexOf(d.properties.IZENA_EU) >= 0) {
                   tip.direction("w");
               } else {
                   tip.direction("s");
               }
            }
        }

        tip.html(function(d) {

            var katea = "";

            // Udalerrien mapek d.properties.datuak daukate, herri elkargoarenak ez.
            if (d.properties.datuak) {

                katea = "<div><strong>" + d.properties.datuak.euskarazko_izena + "</strong></div>" +
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
            } else {

                if (herri_elkargoak[d.properties.IZENA_EU].herriak.ez_daude_deituak > 0) {

                    katea = "<div><strong>" + d.properties.IZENA_EU + " (Biarno)</strong></div>";

                    if (d.properties.IZENA_EU === "Salbaterraldeko herri elkargoa") {
                        katea = katea + "<div class='oharra'>Jeztaze ez dago bozketara deitua</div>";
                    } else if (d.properties.IZENA_EU === "Oloroealdeko herri elkargoa") {
                        katea = katea + "<div class='oharra'>Eskiula ez dago bozketara deitua</div>";
                    }
                } else {
                    katea = "<div><strong>" + d.properties.IZENA_EU + "</strong></div>" +
                            "<table class='herri-elkargoa-mapa-taula'>" +
                                "<thead>" +
                                    "<tr>" +
                                        "<th></th>" +
                                        "<th class='alde'>Alde</th>" +
                                        "<th class='aurka'>Aurka</th>" +
                                    "</tr>" +
                                "</thead>" +
                                "<tbody>" +
                                    "<tr>" +
                                        "<td>Herriak</td>" +
                                        "<td class='alde'>" + herri_elkargoak[d.properties.IZENA_EU].herriak.alde + "</td>" +
                                        "<td class='aurka'>" + herri_elkargoak[d.properties.IZENA_EU].herriak.aurka + "</td>" +
                                    "</tr>" +
                                    "<tr>" +
                                    "<td>Biztanleak</td>" +
                                        "<td class='alde'>" + herri_elkargoak[d.properties.IZENA_EU].biztanleak.alde + "</td>" +
                                        "<td class='aurka'>" + herri_elkargoak[d.properties.IZENA_EU].biztanleak.aurka + "</td>" +
                                    "</tr>" +
                                "</tbody>" +
                            "</table>";
                }
            }
            return katea;

        });

        tip.show(d);
    }

    function marraztuHerriElkargoenKoropletaMapa(herri_elkargoak) {

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
                    onMouseOver(d, "elkargoen-koropleta-mapa");
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

    function marraztuHerriElkargoenSinboloProportzionalenMapa(herri_elkargoak) {

        // Datu geografikoak irakurri dagokion topoJSONetik.
        d3.json(aukerak.topoJSON_herri_elkargoak, function(error, geodatuak) {

            if (error) {
                return console.error(error);
            }

            // Elkargo guztiak.
            herri_elkargoen_sinbolo_proportzionalen_mapa_svg.selectAll(".unitatea")
                .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena_herri_elkargoak]).features)
                .enter().append("path")
                .attr("fill", function(d) {

                    // Herri elkargoko emaitzen arabera koloreztatuko dugu.
                    if (herri_elkargoak[d.properties.IZENA_EU].herriak.ez_daude_deituak > 0)  {
                        return "url('#pattern-stripe')";
                    }

                    // Emaitzarik ez badago...
                    return aukerak.koloreak.lehenetsia;

                })
                .attr("class", "unitatea")
                .attr("id", function(d) { return "sinbolo-proportzionalen-unitatea-" + d.properties.H_ELK_KODE; })
                .attr("d", herri_elkargoen_sinbolo_proportzionalen_maparen_bidea)
                .on("mouseover", function(d) {
                    onMouseOver(d, "elkargoen-sinbolo-proportzionalen-mapa");
                })
                .on("mouseout", function(d) {
                    onMouseOut(d);
                })
                .call(tip);

            // Kanpo-mugak (a === b)
            herri_elkargoen_sinbolo_proportzionalen_mapa_svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena_herri_elkargoak], function(a, b) { return a === b; }))
                .attr("d", herri_elkargoen_sinbolo_proportzionalen_maparen_bidea)
                .attr("class", "kanpo-mugak");

            // Unitateak aurreko planora ekarri.
            herri_elkargoen_sinbolo_proportzionalen_mapa_svg.selectAll(".unitatea").each(function() {
                var sel = d3.select(this);
                sel.moveToFront();
            });

            // Eskualdeen arteko mugak (a !== b)
            herri_elkargoen_sinbolo_proportzionalen_mapa_svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena_herri_elkargoak], function(a, b) { return a !== b; }))
                .attr("d", herri_elkargoen_sinbolo_proportzionalen_maparen_bidea)
                .attr("class", "eskualde-mugak");

            var radius = d3.scale.sqrt()
                .domain([0,
                        d3.max(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena_herri_elkargoak]).features,
                               function(d) {
                                   return herri_elkargoak[d.properties.IZENA_EU].biztanleak.guztira;
                               }
                        )
                ])
                .range([0, 25]);

            herri_elkargoen_sinbolo_proportzionalen_mapa_svg.append("g")
                .attr("class", "zirkulua")
                .selectAll("circle")
                .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena_herri_elkargoak]).features)
                .enter().append("circle")
                .attr("transform", function(d) {
                    return "translate(" + herri_elkargoen_sinbolo_proportzionalen_maparen_bidea.centroid(d) + ")";
                })
                .attr("r", function(d) {

                    return radius(herri_elkargoak[d.properties.IZENA_EU].biztanleak.guztira);

                })
                .attr("fill", function(d) {

                    // Emaitza HELEParen aldekoa bada...
                    if (herri_elkargoak[d.properties.IZENA_EU].herriak.alde > herri_elkargoak[d.properties.IZENA_EU].herriak.aurka) {

                        return aukerak.koloreak.bai;

                    // Kontrakoa bada berriz...
                    } else {

                        return aukerak.koloreak.ez;

                    }

                    // Daturik ez badago...
                    return "#ffffff";

                })
                .on("mouseover", function(d) {
                    onMouseOver(d, "elkargoen-sinbolo-proportzionalen-mapa");
                })
                .on("mouseout", function(d) {
                    onMouseOut(d);
                });
        });
    }

    function bistaratuHerrialdeenTaulakoDatuak(herrialdeak) {

        document.getElementById("lapurdi-herriak-alde").innerHTML = herrialdeak["Lapurdi"].herriak.alde;
        document.getElementById("nafarroa-beherea-herriak-alde").innerHTML = herrialdeak["Nafarroa Beherea"].herriak.alde;
        document.getElementById("zuberoa-herriak-alde").innerHTML = herrialdeak["Zuberoa"].herriak.alde;
        document.getElementById("biarno-herriak-alde").innerHTML = herrialdeak["Biarno"].herriak.alde;

        document.getElementById("lapurdi-herriak-aurka").innerHTML = herrialdeak["Lapurdi"].herriak.aurka;
        document.getElementById("nafarroa-beherea-herriak-aurka").innerHTML = herrialdeak["Nafarroa Beherea"].herriak.aurka;
        document.getElementById("zuberoa-herriak-aurka").innerHTML = herrialdeak["Zuberoa"].herriak.aurka;
        document.getElementById("biarno-herriak-aurka").innerHTML = herrialdeak["Biarno"].herriak.aurka;

        document.getElementById("lapurdi-biztanleak-alde").innerHTML = herrialdeak["Lapurdi"].biztanleak.alde;
        document.getElementById("nafarroa-beherea-biztanleak-alde").innerHTML = herrialdeak["Nafarroa Beherea"].biztanleak.alde;
        document.getElementById("zuberoa-biztanleak-alde").innerHTML = herrialdeak["Zuberoa"].biztanleak.alde;
        document.getElementById("biarno-biztanleak-alde").innerHTML = herrialdeak["Biarno"].biztanleak.alde;

        document.getElementById("lapurdi-biztanleak-aurka").innerHTML = herrialdeak["Lapurdi"].biztanleak.aurka;
        document.getElementById("nafarroa-beherea-biztanleak-aurka").innerHTML = herrialdeak["Nafarroa Beherea"].biztanleak.aurka;
        document.getElementById("zuberoa-biztanleak-aurka").innerHTML = herrialdeak["Zuberoa"].biztanleak.aurka;
        document.getElementById("biarno-biztanleak-aurka").innerHTML = herrialdeak["Biarno"].biztanleak.aurka;
    }

    function bistaratuElkargoenTaulakoDatuak(elkargoak) {

        document.getElementById("amikuze-herriak-alde").innerHTML = elkargoak["Amikuzeko herri elkargoa"].herriak.alde;
        document.getElementById("aturri-errobi-herriak-alde").innerHTML = elkargoak["Aturri Errobi herri elkargoa"].herriak.alde;
        document.getElementById("bidaxune-herriak-alde").innerHTML = elkargoak["Bidaxuneko herri elkargoa"].herriak.alde;
        document.getElementById("errobi-herriak-alde").innerHTML = elkargoak["Errobi herri elkargoa"].herriak.alde;
        document.getElementById("euskal-kostaldea-herriak-alde").innerHTML = elkargoak["Euskal Kostaldea - Aturri hirigunea"].herriak.alde;
        document.getElementById("garazi-baigorri-herriak-alde").innerHTML = elkargoak["Garazi-Baigorri herri elkargoa"].herriak.alde;
        document.getElementById("hazparne-herriak-alde").innerHTML = elkargoak["Hazparneko Lurraldea herri elkargoa"].herriak.alde;
        document.getElementById("hego-lapurdi-herriak-alde").innerHTML = elkargoak["Hego Lapurdiko Hirigunea"].herriak.alde;
        document.getElementById("iholdi-oztibarre-herriak-alde").innerHTML = elkargoak["Iholdi-Oztibarreko herri elkargoa"].herriak.alde;
        document.getElementById("xiberoa-herriak-alde").innerHTML = elkargoak["Xiberoa herri alkargoa"].herriak.alde;

        document.getElementById("amikuze-herriak-aurka").innerHTML = elkargoak["Amikuzeko herri elkargoa"].herriak.aurka;
        document.getElementById("aturri-errobi-herriak-aurka").innerHTML = elkargoak["Aturri Errobi herri elkargoa"].herriak.aurka;
        document.getElementById("bidaxune-herriak-aurka").innerHTML = elkargoak["Bidaxuneko herri elkargoa"].herriak.aurka;
        document.getElementById("errobi-herriak-aurka").innerHTML = elkargoak["Errobi herri elkargoa"].herriak.aurka;
        document.getElementById("euskal-kostaldea-herriak-aurka").innerHTML = elkargoak["Euskal Kostaldea - Aturri hirigunea"].herriak.aurka;
        document.getElementById("garazi-baigorri-herriak-aurka").innerHTML = elkargoak["Garazi-Baigorri herri elkargoa"].herriak.aurka;
        document.getElementById("hazparne-herriak-aurka").innerHTML = elkargoak["Hazparneko Lurraldea herri elkargoa"].herriak.aurka;
        document.getElementById("hego-lapurdi-herriak-aurka").innerHTML = elkargoak["Hego Lapurdiko Hirigunea"].herriak.aurka;
        document.getElementById("iholdi-oztibarre-herriak-aurka").innerHTML = elkargoak["Iholdi-Oztibarreko herri elkargoa"].herriak.aurka;
        document.getElementById("xiberoa-herriak-aurka").innerHTML = elkargoak["Xiberoa herri alkargoa"].herriak.aurka;

        document.getElementById("amikuze-biztanleak-alde").innerHTML = elkargoak["Amikuzeko herri elkargoa"].biztanleak.alde;
        document.getElementById("aturri-errobi-biztanleak-alde").innerHTML = elkargoak["Aturri Errobi herri elkargoa"].biztanleak.alde;
        document.getElementById("bidaxune-biztanleak-alde").innerHTML = elkargoak["Bidaxuneko herri elkargoa"].biztanleak.alde;
        document.getElementById("errobi-biztanleak-alde").innerHTML = elkargoak["Errobi herri elkargoa"].biztanleak.alde;
        document.getElementById("euskal-kostaldea-biztanleak-alde").innerHTML = elkargoak["Euskal Kostaldea - Aturri hirigunea"].biztanleak.alde;
        document.getElementById("garazi-baigorri-biztanleak-alde").innerHTML = elkargoak["Garazi-Baigorri herri elkargoa"].biztanleak.alde;
        document.getElementById("hazparne-biztanleak-alde").innerHTML = elkargoak["Hazparneko Lurraldea herri elkargoa"].biztanleak.alde;
        document.getElementById("hego-lapurdi-biztanleak-alde").innerHTML = elkargoak["Hego Lapurdiko Hirigunea"].biztanleak.alde;
        document.getElementById("iholdi-oztibarre-biztanleak-alde").innerHTML = elkargoak["Iholdi-Oztibarreko herri elkargoa"].biztanleak.alde;
        document.getElementById("xiberoa-biztanleak-alde").innerHTML = elkargoak["Xiberoa herri alkargoa"].biztanleak.alde;

        document.getElementById("amikuze-biztanleak-aurka").innerHTML = elkargoak["Amikuzeko herri elkargoa"].biztanleak.aurka;
        document.getElementById("aturri-errobi-biztanleak-aurka").innerHTML = elkargoak["Aturri Errobi herri elkargoa"].biztanleak.aurka;
        document.getElementById("bidaxune-biztanleak-aurka").innerHTML = elkargoak["Bidaxuneko herri elkargoa"].biztanleak.aurka;
        document.getElementById("errobi-biztanleak-aurka").innerHTML = elkargoak["Errobi herri elkargoa"].biztanleak.aurka;
        document.getElementById("euskal-kostaldea-biztanleak-aurka").innerHTML = elkargoak["Euskal Kostaldea - Aturri hirigunea"].biztanleak.aurka;
        document.getElementById("garazi-baigorri-biztanleak-aurka").innerHTML = elkargoak["Garazi-Baigorri herri elkargoa"].biztanleak.aurka;
        document.getElementById("hazparne-biztanleak-aurka").innerHTML = elkargoak["Hazparneko Lurraldea herri elkargoa"].biztanleak.aurka;
        document.getElementById("hego-lapurdi-biztanleak-aurka").innerHTML = elkargoak["Hego Lapurdiko Hirigunea"].biztanleak.aurka;
        document.getElementById("iholdi-oztibarre-biztanleak-aurka").innerHTML = elkargoak["Iholdi-Oztibarreko herri elkargoa"].biztanleak.aurka;
        document.getElementById("xiberoa-biztanleak-aurka").innerHTML = elkargoak["Xiberoa herri alkargoa"].biztanleak.aurka;

    }

    var eskala = eskalatu();

    var aukerak = {
        kolore_mapa: {
            zabalera: 680,
            altuera: 565,
            proiekzioa: {
                erdia: {
                    lat: -1.22,
                    lng: 43.20
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
            zabalera: 330,
            altuera: 240,
            proiekzioa: {
                erdia: {
                    lat: -1.22,
                    lng: 43.25
                },
                eskala: 16000
            }
        },
        herri_elkargoen_sinbolo_proportzionalen_mapa: {
            zabalera: 330,
            altuera: 240,
            proiekzioa: {
                erdia: {
                    lat: -1.22,
                    lng: 43.25
                },
                eskala: 16000
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

    // Herri elkargoen sinbolo proportzionalen maparen proiekzioaren xehetasunak.
    var herri_elkargoen_sinbolo_proportzionalen_maparen_proiekzioa = d3.geo.mercator()
        .center([aukerak.herri_elkargoen_sinbolo_proportzionalen_mapa.proiekzioa.erdia.lat, aukerak.herri_elkargoen_sinbolo_proportzionalen_mapa.proiekzioa.erdia.lng])
        .scale(aukerak.herri_elkargoen_sinbolo_proportzionalen_mapa.proiekzioa.eskala)
        .translate([aukerak.herri_elkargoen_sinbolo_proportzionalen_mapa.zabalera / 2, aukerak.herri_elkargoen_sinbolo_proportzionalen_mapa.altuera / 2]);

    // Kolore-maparen bidearen generatzailea.
    var kolore_maparen_bidea = d3.geo.path()
        .projection(kolore_maparen_proiekzioa);

    // Sinbolo proportzionalen maparen bidearen generatzailea.
    var sinbolo_proportzionalen_maparen_bidea = d3.geo.path()
        .projection(sinbolo_proportzionalen_maparen_proiekzioa);

    // Herri elkargoen kolore-maparen bidearen generatzailea.
    var herri_elkargoen_koropleta_maparen_bidea = d3.geo.path()
        .projection(herri_elkargoen_koropleta_maparen_proiekzioa);

    // Herri elkargoen sinbolo proportzionalen bidearen generatzailea.
    var herri_elkargoen_sinbolo_proportzionalen_maparen_bidea = d3.geo.path()
        .projection(herri_elkargoen_sinbolo_proportzionalen_maparen_proiekzioa);

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

    // Herri elkargoen sinbolo proportzionalen maparen svg elementua eskuratu eta neurriak ezarri.
    var herri_elkargoen_sinbolo_proportzionalen_mapa_svg = d3.select("#herri-elkargoen-sinbolo-proportzionalen-mapa svg")
        .attr("width", aukerak.herri_elkargoen_sinbolo_proportzionalen_mapa.zabalera)
        .attr("height", aukerak.herri_elkargoen_sinbolo_proportzionalen_mapa.altuera);

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
                                    ez_daude_deituak: 0,
                                    guztira: 0
                                },
                                biztanleak: {
                                    alde: 0,
                                    aurka: 0,
                                    erabakitzeke: 0,
                                    ez_daude_deituak: 0,
                                    guztira: 0
                                }
                            };
                        }

                        if (!herrialdeak[d.herrialdea]) {

                            herrialdeak[d.herrialdea] = {
                                herriak: {
                                    alde: 0,
                                    aurka: 0,
                                    erabakitzeke: 0,
                                    ez_daude_deituak: 0,
                                    guztira: 0
                                },
                                biztanleak: {
                                    alde: 0,
                                    aurka: 0,
                                    erabakitzeke: 0,
                                    ez_daude_deituak: 0,
                                    guztira: 0
                                }
                            };
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

                        herri_elkargoak[d.herri_elkargoa_2016].biztanleak.guztira = herri_elkargoak[d.herri_elkargoa_2016].biztanleak.guztira + biztanleria2016;
                        herrialdeak[d.herrialdea].biztanleak.guztira = herrialdeak[d.herrialdea].biztanleak.guztira + biztanleria2016;

                        herri_elkargoak[d.herri_elkargoa_2016].herriak.guztira++;
                        herrialdeak[d.herrialdea].herriak.guztira++;
                    }
                });
            });

            bistaratuHerrialdeenTaulakoDatuak(herrialdeak);
            bistaratuElkargoenTaulakoDatuak(herri_elkargoak);
            marraztuHerriElkargoenKoropletaMapa(herri_elkargoak);
            marraztuHerriElkargoenSinboloProportzionalenMapa(herri_elkargoak);

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

            // add legend
        	var legend = svg.append("g")
        	  .attr("class", "legend")
        	  .attr("height", 100)
        	  .attr("width", 100);


            legend.selectAll('rect')
                .data([0, 1, 2]) // 3 kolore daude legendan, baina aukerak.koloreak objektu bat da, ez array bat.
                .enter()
                .append("rect")
                .attr("x", 460)
                .attr("y", function(d, i){ return 30 + i * 25;})
                .attr("width", 18)
                .attr("height", 18)
                .attr("stroke-width", "1px")
                .attr("stroke", "#ccc")
                .style("fill", function(d, i) {

                    var kolorea = aukerak.koloreak.lehenetsia;

                    if (i === 0) {
                        kolorea = aukerak.koloreak.bai;
                    } else if (i === 1) {
                        kolorea = aukerak.koloreak.ez;
                    } else if (i === 2) {
                        kolorea = "url('#pattern-stripe')";
                    }

                    return kolorea;
                });

                legend.selectAll('text')
                    .data([0, 1, 2]) // 3 kolore daude legendan, baina aukerak.koloreak objektu bat da, ez array bat.
                    .enter()
                    .append("text")
                    .attr("x", 485)
                    .attr("y", function(d, i){ return 45 + i * 25;})
                    .attr("font-size", "14px")
                    .text(function(d, i) {

                        var legenda = "";

                        if (i === 0) {
                            legenda = "Alde";
                        } else if (i === 1) {
                            legenda = "Aurka";
                        } else if (i === 2) {
                            legenda = "Ez dago bozketara deitua";
                        }

                        return legenda;
                    });

                /*legend.selectAll("foreignObject")
                    .data([0, 1, 2]) // 3 elementu daude legendan, baina aukerak.koloreak objektu bat da, ez array bat.
                    .enter()
                    .append("foreignObject")
                    .attr("x", 525)
                    .attr("y", function(d, i) { return 330 + i * 25;})
                    .attr("width", 150)
                    .attr("height", function(d, i) {
                        if (i === 2) {
                            return 50;
                        }
                        return 25;
                    })
                    .html(function(d, i) {

                        var legenda = "";

                        if (i === 0) {
                            legenda = "Alde";
                        } else if (i === 1) {
                            legenda = "Aurka";
                        } else if (i === 2) {
                            legenda = "Ez dago bozketara deitua *";
                        }

                        return legenda;
                    });*/
        });
    });
}());
