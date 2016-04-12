var drawNumberOfReadsChart = function (rawdata, numberOfLines, sequence_count) {
    var data = [],
        categories = [
            "Initial Reads",
            "Reads after fastq trimming and filtering",
            "Reads after length filtering",
            "Reads after ambiguous base filtering",
            "Unique reads after clustering",
            "Reads after repeat masking and filtering",
        ].splice(0, numberOfLines);

    rawdata.split('\n')
        .splice(0, numberOfLines)
        .forEach(function(line,i){
            var line = line.split("\t");
            //categories.push(line[0]);
            data.push({
                y: line[1]*1,
                x:i,
                color: "#058dc7"
            });
        });

    if (sequence_count!= null && data[3].y > sequence_count) {
        categories.push("Reads after sampling for QC");
        data.push({
            x: numberOfLines,
            y: sequence_count,
            color: "#8dc7c7"
        });
    }
    var length = data[0];
    $('#qc_overview').highcharts({
        chart: { type: 'bar', height: 250 },
        title: { text: 'Number of Sequence Reads'},
        xAxis: {
            categories: categories,
            title: { enabled: false }
        },
        plotOptions: {
            series: {
                grouping: false,
                shadow: false,
                borderWidth: 0,
                stacking: 'normal'
            }
        },
        series: [{
            name : "Reads Filtered out",
            data : data.map(function(n){
                var current = length- n.y;
                length = n.y;
                return current;
            }),
            color: "#ccccdd",
            pointPadding: -0.1
        },{
            name : "Number of reads",
            data : data,
            color: "#058dc7",
            pointPadding: -0.1
        }],
        credits: false
    });
};

var drawSequenceLengthHistogram = function (rawdata, isFromSubset) {
    var data = rawdata.split('\n').map(function(line){
        if (line.trim()!="")
            return line.split("\t").map(function(v){ return 1*v; });
    });

    $('#seq_len').highcharts({
        chart: { type: 'areaspline' },
        title: { text: 'Sequence Length Histogram'},
        subtitle: { text: (isFromSubset)?'A subset of the sequences was used to generate this chart':undefined},
        yAxis: {
            title: { text: "Number of Reads Uploaded" }
        },
        series : [
            { name : 'Sequences',
                data : [[0,0]].concat(data),
                color: (isFromSubset)?"#8dc7c7":"#058dc7"
            }
        ],
        legend: {
            layout: "vertical",
            align: "right",
            verticalAlign: "top",
            y: 50,
            borderWidth: 1,
            floating: true
        },
        credits: false
    });
};

var drawSequncesLength = function(data) {
    $('#seq_stats').highcharts({
        chart: {
            type: 'bar',
            height: 150
        },
        title: false,
        xAxis: {
            categories: ['Sequence'],
            title: { enabled: false }
        },
        yAxis: {
            min: 0,
            max: 100*(Math.floor(data["length_max"]/100)+1),
            title: { text: 'Sequence length (bp)' }
        },
        plotOptions: {
            series: {
                grouping: false,
                shadow: false,
                borderWidth: 0
            }
        },
        series : [
            { name : 'Max Length',
                pointPadding: 0.25,
                color: "rgb(114, 63, 191)",
                data : [data["length_max"]]
            },{
                name : 'Avg Length',
                pointPadding: 0.25,
                color: "rgb(63, 114, 191)",
                tooltip: {
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>'+data["average_length"]+'</b><br/>',
                },
                data : [data["average_length"]]
            },{
                name : 'Min Length',
                color: "rgb(114, 191, 63)",
                pointPadding: 0.25,
                data : [data["length_min"]]
            },{
                name : 'Standard Deviation',
                threshold:data["average_length"]-data["standard_deviation_length"],
                data : [data["average_length"]+data["standard_deviation_length"]],
                tooltip: {
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>'+data["standard_deviation_length"]+'</b><br/>',
                },
                color: "rgba(191, 191, 63, 0.5)"
            }
        ],
        credits: false
    });
};

var drawGCContent = function(data) {
    $('#seq_gc_stats').highcharts({
        chart: {
            type: 'bar',
            height: 150
        },
        title: false,
        xAxis: {
            categories: ['Content'],
            title: { enabled: false }
        },
        yAxis: {
            min: 0,
            max: 100,
            title: { text: 'GC Content (%)' }
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
                tooltip: {
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>'+data["average_gc_content"]+'</b><br/><span style="color:{point.color}">\u25CF</span> GC ratio: <b>'+data["average_gc_ratio"]+'</b><br/>',
                },
                data : [data["average_gc_content"]]
            },{
                name : 'AT Content',
                color: "rgb(114, 63, 191)",
                pointPadding: 0.25,
                threshold:data["average_gc_content"],
                tooltip: {
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>'+(100-data["average_gc_content"])+'</b><br/>',
                },
                data : [100]
            },{
                name : 'Standard Deviation for the GC content',
                threshold:data["average_gc_content"]-data["standard_deviation_gc_content"],
                data : [data["average_gc_content"]+data["standard_deviation_gc_content"]],
                tooltip: {
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>'+data["standard_deviation_gc_content"]+'</b><br/><span style="color:{point.color}">\u25CF</span> Standard Deviation GC ratio: <b>'+data["standard_deviation_gc_ratio"]+'</b><br/>',
                },
                color: "rgba(191, 191, 63, 0.5)"
            }
        ],
        credits: false
    });
};

var drawSequenceGCDistribution = function (rawdata,isFromSubset) {
    var data = rawdata.split('\n').map(function(line){
        if (line.trim()!="")
            return line.split("\t").map(function(v){ return 1*v; });
    });
    // Create the chart
    $('#seq_gc').highcharts({
        chart: { type: 'areaspline' },
        title: { text: 'Sequence GC Distribution' },
        subtitle: { text: (isFromSubset)?'A subset of the sequences was used to generate this chart':undefined},
        yAxis: { title: { text: "Number of Reads Uploaded" } },

        series : [{
            name : 'Sequences',
            data : data,
            color: (isFromSubset)?"#8dc7c7":"#058dc7"
        }],
        legend: {
            layout: "vertical",
            align: "right",
            verticalAlign: "top",
            y: 50,
            borderWidth: 1,
            floating: true
        },
        credits: false
    });
};

var drawNucleotidePositionHistogram = function (rawdata,isFromSubset) {
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
        chart: { type: 'area' },
        title: { text: 'Nucleotide Position Histogram ' },
        subtitle: { text: (isFromSubset)?'A subset of the sequences was used to generate this chart':undefined},
        xAxis: {
            categories: data["pos"],
            tickmarkPlacement: 'on',
            title: { enabled: false }
        },
        yAxis: {
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
        credits: false
    });
};

