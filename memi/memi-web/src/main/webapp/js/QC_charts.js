
Highcharts.setOptions({
    lang: {
        downloadData: "Download data file"
    }
});
var zoom_msg = "Click and drag in the plot area to zoom in";

var getExportingStructure = function (urlToFile,content) {
    return {
        buttons: {
            contextButton: {
                symbol: 'url(/metagenomics/img/ico_download_custom.svg)',
                menuItems: [{
                    textKey: 'downloadData',
                    onclick: function () {
                        if (typeof content === "undefined") {
                            window.location = urlToFile;
                        }else{
                            var element = document.createElement('a');
                            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
                            element.setAttribute('download', urlToFile);

                            element.style.display = 'none';
                            document.body.appendChild(element);

                            element.click();

                            document.body.removeChild(element);
                        }
                    }
                }, {
                    separator: true
                }, {
                    textKey: 'printChart',
                    onclick: function () {
                        this.print();
                    }
                }, {
                    separator: true
                }, {
                    textKey: 'downloadPNG',
                    onclick: function () {
                        this.exportChart({
                            width: 1200,
                            filename:'sq_sum_bar_chart'// externalRunId need to be added to the model - NOTE the name is common between QC and Functional
                        });
                    }
                }, {
                    textKey: 'downloadJPEG',
                    onclick: function () {
                        this.exportChart({
                            width: 1200,
                            filename:'sq_sum_bar_chart',// externalRunId need to be added to the model - NOTE the name is common between QC and Functional
                            type: 'image/jpeg'
                        });
                    }
                }, {
                    textKey: 'downloadPDF',
                    onclick: function () {
                        this.exportChart({
                            filename:'sq_sum_bar_chart',// externalRunId need to be added to the model - NOTE the name is common between QC and Functional
                            type: 'application/pdf'
                        });
                    }
                }, {
                    textKey: 'downloadSVG',
                    onclick: function () {
                        this.exportChart({
                            filename:'sq_sum_bar_chart',// externalRunId need to be added to the model - NOTE the name is common between QC and Functional
                            type: 'image/svg+xml'
                        });
                    }
                }]
            }
        }
    };
}
var sumNumberOfReadsChart = function (rawdata, numberOfLines, sequenceCount, urlToFile, release_version) {
    if (typeof rawdata === "undefined" || rawdata === null) return;
    var data = [];

    //Preparing the right labels for the charts. That is depending on the pipeline version.
    var second_category = null;
    if (release_version == "1.0" || release_version == "2.0") {
        second_category = "Reads with predicted rRNA"
    } else if (release_version == "3.0" || release_version == "4.0" || release_version == "4.1") {
        second_category = "Reads with predicted RNA"
    } else{
        $('#sq_sum').html("<div class='msg_error'>This pipeline version does not supported the sequence summary feature yet.</div>");//shouldn't happen
        return;
    }
    var categories = [
        "Reads with predicted CDS",
        second_category,
        "Reads with InterPro match",
        "Predicted CDS",
        "Predicted CDS with InterPro match",
    ].splice(0, numberOfLines);

    //Parse values from text file and store key values in a map
    var feature_counts = [];
    rawdata.split('\n')
        //.splice(4, numberOfLines)//important - start at position 6 as we don't need the first lines
        .forEach(function (l ,i) {

            var line = l.split("\t");
            var key = String(line[0]).trim();
            var value = Number(line[1]);
            if (key == "Nucleotide sequences with predicted CDS") {
                feature_counts[0] = value;
            } else if (key == "Nucleotide sequences with InterProScan match") {
                feature_counts[2] = value;
            } else if (key == "Predicted CDS") {
                feature_counts[3] = value;
            } else if (key == "Predicted CDS with InterProScan match") {
                feature_counts[4] = value;
            } else if (key.endsWith("RNA")) {
                feature_counts[1] = value;
            }
        });
    for (var i = 0; i < feature_counts.length; i++) {
        data.push({
            y: feature_counts[i],
            x: data.length,
            color: "#058dc7"
        });
    }


    if (data.length < 2){
        $('#sq_sum').html("<div class='msg_error'>There is no sequence summary data available for this run.</div>");//shouldn't happen
        return;
    } else if (feature_counts.length != 5) {
        $('#sq_sum').html("<div class='msg_error'>Could not parse all sequence summary counts for this run.</div>");
    }

    categories = categories.filter(function(value){ return value!=null});
    var series = [{
            name : "Reads",
            data : data,
            color: "#058dc7",
            pointPadding: 0
        }];
    $('#sq_sum').highcharts({
        chart: { type: 'bar', height: 220,
            style: {
            fontFamily: 'Helvetica'
         }
        },
        title: {
            text: 'Sequence feature summary',
            style: {
                fontSize:16,
                fontWeight: "bold"
            }
        },
         tooltip: {
           backgroundColor: 'white',
           headerFormat: '',
           useHTML: true,
            pointFormatter: function () {
            return '<span style="color:'+this.color+'">&#9632;</span> '+this.category+': <br/><strong>'+(this.y)+'</strong>';
             }
         },
        legend: {
            enabled:false,
            itemStyle: {fontWeight: "regular"}
        },
        xAxis: {
            categories: categories,
            labels: {
                step:1,
            },
            lineColor: "#595959",
            tickColor: ""
        },
        yAxis: {
            title: {
                text: "Count",
                style: {
                    color: "#a0a0a0"
                }
            },
            opposite: true,
            endOnTick: false,//  no end on a tick
            maxPadding: 0, // get last value on chart closer to edge of chart
            labels: {
                y:-6,
                style:{
                    color: '#bbb'
                }
            },
        },
        plotOptions: {
            series: {
                grouping: false,
                shadow: false,
                borderWidth: 0,
                stacking: 'normal'
            }
        },
        series: series,
        credits: false,
        navigation: {
            buttonOptions: {
                height: 32,
                width: 32,
                symbolX: 16,
                symbolY: 16,
                y: -10
            }
        },
        exporting: getExportingStructure(urlToFile+".tsv",
            categories.map(function(e,i){
                return e + "\t"+ data[i].y;
            }).join("\n")
        )
    });
};

var drawNumberOfReadsChart = function (rawdata, numberOfLines, sequenceCount, urlToFile) {
    if (typeof rawdata == "undefined" || rawdata == null) return;
    var data = [],
        categories = [
            "Initial reads",
            "Trimming",
            "Length filtering",
            "Ambiguous base filtering",
        ].splice(0, numberOfLines),
        remainders = 0;

    rawdata.split('\n')
        .splice(0, numberOfLines)
        .forEach(function(l,i){
            var line = l.split("\t"),
                value =Number(line[1]);
            //categories.push(line[0]);
            if (value>-1)
                data.push({
                    y: value,
                    x: data.length,
                    color: "#058dc7"
                });
            else
                categories[i] = null;

            if (i==3) remainders = value;
        });

    if (sequenceCount!= null && remainders > sequenceCount) {
        categories.push("Reads subsampled for QC analysis");
        data.push({
            x: data.length,
            y: sequenceCount,
            color: "#8dc7c7"
        });
    }
    if (data.length<2){
        $('#qc_overview').html("<div class='msg_error'>There is no quality control data available for this run.</div>");
        return;
    }
    categories = categories.filter(function(value){ return value!=null});
    var length = data[0],
        series = [{
            name : "Reads filtered out",
            data : data.map(function(n){
                var current = length- n.y;
                length = n.y;
                return current;
            }),
            color: "#ccccdd",
            pointPadding: -0.1
        },{
            name : "Reads remaining",
            data : data,
            color: "#058dc7",
            pointPadding: -0.1
        }];
    if (sequenceCount!= null && remainders > sequenceCount)
        series.push({
            name: "Reads after sampling",
            color: "#8dc7c7"
        });

    $('#qc_overview').highcharts({
        chart: { type: 'bar', height: 250,
            style: {
            fontFamily: 'Helvetica'
        }
        },
        title: {
            text: 'Number of sequence reads per QC step',
            style: {
                fontSize:16,
                fontWeight: "bold"
            }
        },
        xAxis: {
                categories: categories,
                lineColor: "#595959",
                tickColor: ""
        },
        yAxis: {
            title: { text: "Count" }
        },
        plotOptions: {
            series: {
                grouping: false,
                shadow: false,
                borderWidth: 0,
                stacking: 'normal'
            }
        },
        series: series,
        credits: false,
        navigation: {
            buttonOptions: {
                height: 32,
                width: 32,
                symbolX: 16,
                symbolY: 16,
                y: -10
            }
        },
        exporting: getExportingStructure(urlToFile+".tsv",
            categories.map(function(e,i){
                return e + "\t"+ data[i].y;
            }).join("\n")
        )
    });
};

var drawSequenceLengthHistogram = function (rawdata, isFromSubset, stats,urlToFile) {
    if (typeof rawdata == "undefined" || rawdata == null) return;
    var data = rawdata.split('\n').filter(function(line){ return line.trim()!=""})
        .map(function(line){
            return line.split("\t").map(function(v){ return 1*v; });
    });
    var length_max=Math.max.apply(null,data.map(function(e){ if (e) {return e[0];} }));

    $('#seq_len').highcharts({
        chart: {
            marginLeft: 78, // Keep both charts - lenght histogram & bar chart - left aligned
            style: {
                fontFamily: 'Helvetica'
            },
            zoomType: 'x'
        },
        title: {
            text: 'Reads length histogram',
            style: {
                fontSize:16,
                fontWeight: "bold"
            }
        },
        subtitle: { text: ((isFromSubset)?'A subset of the sequences was used to generate this chart -':'')+zoom_msg},
        yAxis: {
            title: { text: "Number of reads" }
        },
        xAxis: {
            min: 0,
            max: 100*(Math.floor(length_max/100)+1),
            plotBands: (stats==null)?[]:[{ // visualize the standard deviation
                from: stats["average_length"]-stats["standard_deviation_length"],
                to: stats["average_length"]+stats["standard_deviation_length"],
                color: 'rgba(128, 128, 128, .2)',
                label: {
                    text: "Standard Deviation<br/>\u00B1"+(stats["standard_deviation_length"].toFixed(2)),
                    style: {
                        color: "#666666",
                        fontSize: "0.8em"
                    }
                }
            }]
        },
        series : [
            { name : 'Reads',
                data : data,
                color: (isFromSubset)?"#8dc7c7":"#058dc7"
            }
        ],
        legend: { enabled: false},
        credits: false,
        navigation: {
            buttonOptions: {
                height: 32,
                width: 32,
                symbolX: 16,
                symbolY: 16,
                y: -10
            }
        },
        exporting: getExportingStructure(urlToFile)
    });
};

var drawSequncesLength = function(data) {
    if (typeof data == "undefined" || data == null) return;
    $('#seq_stats').highcharts({
        chart: {
            type: 'bar',
            marginTop: 0, // Keep all charts left aligned
            height: 120
        },
        title: false,
        xAxis: {
            categories: ['Minimum', 'Average', 'Maximum'],
            title: { enabled: false },
                lineColor: "#595959",
                tickColor: ""
        },
            yAxis: {
            min: 0,
            max: 100*(Math.floor(data["length_max"]/100)+1),
            title: { text: 'Sequence length (bp)' },
            plotBands: [{ // visualize the standard deviation
                from: data["average_length"]-data["standard_deviation_length"],
                to: data["average_length"]+data["standard_deviation_length"],
                color: 'rgba(128, 128, 128, .2)'
            }]
        },
        plotOptions: {
            series: {
                grouping: false,
                shadow: false,
                borderWidth: 0
            }
        },
        series : [
            {   name: "Length",
                data : [
                    { y: data["length_min"], x:0, color: "rgb(114, 191, 63)"},
                    { y: data["average_length"], x:1, color: "rgb(63, 114, 191)"},
                    { y: data["length_max"], x:2, color: "rgb(114, 63, 191)"}
                ],
                pointPadding: -0.2,
                tooltip: {
                    pointFormatter: function () {
                        return '<span style="color:'+this.color+'">\u25CF</span> '+this.category+': <b>'+(this.y).toFixed(2)+'</b><br/>';
                    }
                }
            }
        ],
        legend: { enabled: false},
        credits: false,
        navigation: {
            buttonOptions: {
                height: 32,
                width: 32,
                symbolX: 16,
                symbolY: 16,
                y: -10
            }
        },
        exporting: { enabled: false }
    });
};

var drawGCContent = function(data) {
    if (typeof data == "undefined" || data == null) return;
    $('#seq_gc_stats').highcharts({
        chart: {
            type: 'bar',
            marginTop: 0, // Keep all charts left aligned
            height: 150
        },
        title: false,
        xAxis: {
            categories: ['Content'],
            title: { enabled: false },
            lineColor: "#595959",
            tickColor: ""
        },
        yAxis: {
            min: 0,
            max: 100,
            title: { enabled: false },
            plotBands: [{ // visualize the standard deviation
                from: data["average_gc_content"]-data["standard_deviation_gc_content"],
                to: data["average_gc_content"]+data["standard_deviation_gc_content"],
                color: 'rgba(128, 128, 128, .2)'
            }]
        },
        plotOptions: {
            series: {
                grouping: false,
                shadow: false,
                borderWidth: 0
            }
        },
        series : [
            { name : 'GC Content',
                pointPadding: 0.25,
                color: "rgb(63, 114, 191)",
                //tooltip: {
                //    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>'+data["average_gc_content"]+'</b><br/><span style="color:{point.color}">\u25CF</span> GC ratio: <b>'+data["average_gc_ratio"]+'</b><br/>',
                //},
                tooltip: {
                    pointFormatter: function () {
                        return '<span style="color:'+this.color+'">\u25CF</span> '+this.series.name+': <b>'+(this.y).toFixed(2)+'%</b><br/>';
                    }
                },
                data : [data["average_gc_content"]]
            },{
                name : 'AT Content',
                color: "rgb(114, 63, 191)",
                pointPadding: 0.25,
                threshold:data["average_gc_content"],
                //tooltip: {
                //    pointFormat: '<span style="color:{point.color}">\u25CF</span> {this.series.name}: <b>'+(100-data["average_gc_content"])+'</b><br/>',
                //},
                tooltip: {
                    pointFormatter: function () {
                        return '<span style="color:'+this.color+'">\u25CF</span> '+this.series.name+': <b>'+(100-data["average_gc_content"]).toFixed(2)+'%</b><br/>';
                    }
                },
                data : [100]
            }
        ],
        credits: false,
        navigation: {
            buttonOptions: {
                height: 32,
                width: 32,
                symbolX: 16,
                symbolY: 16,
                y: -10
            }
        },
        exporting: { enabled: false }
    });
};

var drawSequenceGCDistribution = function (rawdata,isFromSubset, stats, urlToFile) {
    if (typeof rawdata == "undefined" || rawdata == null) return;
    var data = rawdata.split('\n').map(function(line){
        if (line.trim()!="")
            return line.split("\t").map(function(v){ return 1*v; });
    }).reduce(
        function(acc, v) {
            if (v) {
                var key = Math.min(100, Math.max(0, Math.round(v[0])));
                acc[key][1] += v[1];
            }
            return acc;
        },
        Array.apply(null, {length: 101}).map(function (d, i) {return [i,0]})
    );
    // Create the chart
    $('#seq_gc').highcharts({
        chart: {
            style: {
                fontFamily: 'Helvetica'
            },
            zoomType: 'x'
        },
        title: {
            text: 'Reads GC distribution',
            style: {
                fontSize:16,
                fontWeight: "bold"
            }
        },
        subtitle: { text: ((isFromSubset)?'A subset of the sequences was used to generate this chart -':'')+zoom_msg},
        yAxis: {
            title: { text: "Number of reads" }
        },
        xAxis:{
            min: 0,
            max: 100,

            plotBands: (stats==null)?[]:[{ // visualize the standard deviation
                from: stats["average_gc_content"]-stats["standard_deviation_gc_content"],
                to: stats["average_gc_content"]+stats["standard_deviation_gc_content"],
                color: 'rgba(128, 128, 128, .2)',
                borderColor: '#000000',
                label: {
                    text: "Standard Deviation<br/>\u00B1"+(stats["standard_deviation_gc_content"].toFixed(2)),
                    style: {
                        color: "#666666",
                        fontSize: "0.8em"
                    }
                }

            }]
        },
        series : [{
            name : 'Reads',
            data : data,
            color: (isFromSubset)?"#8dc7c7":"#058dc7"
        }],
        legend: { enabled: false },
        credits: false,
        navigation: {
            buttonOptions: {
                height: 32,
                width: 32,
                symbolX: 16,
                symbolY: 16,
                y: -10
            }
        },
        exporting: getExportingStructure(urlToFile)
    });
    $('#seq_gc').parent().parent().before(
        '<p>The histograms below show the distribution of sequence lengths, in basepairs, (left) and GC percentage (right) for the sequences having passed our quality control steps. Note that for large files, the distributions were compiled from a random subset of 2 millions sequence reads. The standard deviations are shown on each plot. The bar chart underneath each graph indicates the minimum, average and maximum length and average GC and AT content, respectively.</p>'
    );
};

var drawNucleotidePositionHistogram = function (rawdata,isFromSubset,urlToFile) {
    if (typeof rawdata == "undefined" || rawdata == null) return;
    var data = {"pos":[], "A":[], "G":[], "T":[], "C":[], "N":[]}
    var colors= {
        "A": "rgb(16, 150, 24)",
        "G": "rgb(255, 153, 0)",
        "C": "rgb(51, 102, 204)",
        "T": "rgb(220, 57, 18)",
        "N": "rgb(138, 65, 23)"
    };
    var headers = null;
    rawdata.split('\n').forEach(function(line){
        if (headers == null) {
            headers = line.split("\t");
        } else {
            line.split("\t").forEach(function(v,i){
                data[headers[i]].push(v*1)
            });
        }
    });
    // Create the chart
    $('#nucleotide').highcharts({
        chart: { type: 'area',
            style: {
            fontFamily: 'Helvetica'
        }
        },
        title: {
            text: 'Nucleotide position histogram',
            style: {
                fontSize:16,
                fontWeight: "bold"
            }
        },
        subtitle: { text: (isFromSubset)?'A subset of the sequences was used to generate this chart':undefined},
        xAxis: {
            categories: data["pos"],
            tickmarkPlacement: 'on',
            title: { enabled: false }
        },
        yAxis: {
            min: 0,
            max: 100,
            title: { enabled: false }
        },
        plotOptions: {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
        },
        tooltip: { shared: true },
        series : ["A","T","C","G","N"].map(function(d){
            return {
                name : d,
                data : data[d],
                color : colors[d]
            }
        }),
        credits: false,
        navigation: {
            buttonOptions: {
                height: 32,
                width: 32,
                symbolX: 16,
                symbolY: 16,
                y: -10
            }
        },
        exporting: getExportingStructure(urlToFile)
    });
    $('#nucleotide').before(
        '<p>The graph below show the relative abundance of nucletotides (A, C, G, T, or ambiguous base "N") at each position starting from the beginning of each read up to the first 500 base pairs.</p>'
    );
};

