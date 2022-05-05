// A $( document ).ready() block.
$(document).ready(function () {
    console.log("ready!")

    d3.json('fileData.json', function (fileData) {
        d3.json('categories55.json', function (lookupData) {
            initialize(lookupData, fileData)
        })
    })
});

function initialize(lookup, data) {
    data.forEach(function (folder) {
        folder.files.forEach(function (file, i) {
            var whichCol = Math.floor(i % 4)
            var colID = `#col${whichCol}`
            var categories = file.categories

            var figure = d3.select(colID)
                .append('figure')
                .attr('class','figures')
                .style('padding-bottom', '20px')
                .style('display', 'show')

            figure.append('img')
                .attr('id', `thumbnail${i}`)
                .attr('class', 'image')
                .attr('src', `${folder.folder}/${file.fileName}`)
                .style('width', '100%')
            figure.append('figcaption')
                .text(folder.folder + ' (Twitter)')
                .style('color', '#ccc')
                .style('font-size', '10px')

            d3.select('#modals').append('div')
                .attr('id', `modal${i}`)
                .attr('class', 'modal')
                .style('opacity', 1)
                // .append('span').attr('class', 'close').html('&times;')
                .append('img').attr('class', 'modal-content').attr('id', `img${i}`)

            var modal = document.getElementById(`modal${i}`);

            // Get the image and insert it inside the modal - use its "alt" text as a caption
            var img = document.getElementById(`thumbnail${i}`);
            var modalImg = document.getElementById(`img${i}`);
            img.onclick = function () {
                modal.style.display = "block";
                modalImg.src = this.src;
            }

            $(`#modal${i}`).click(function (e) {
                $(`#modal${i}`).hide();
            });
        })
    })

    var defaultOptionName; // desired default dropdown name
    d3.select("#dropdown").append("select")
        .on("change", onDropdown)
        .selectAll("option").data(Object.keys(lookup))
        .enter().append("option")
        .attr("value", function (d) { return d; })
        .attr("selected", function (d) {
            return d == defaultOptionName;
        })
        .text(function (d) { return d; });

    d3.select('#clearAll').on('click', function() {
        d3.selectAll('.checkboxes').each(function(d) {
            d3.select(this).property('checked',false)
        })
        update()
    })
    d3.select('#showAll').on('click', function() {
        d3.selectAll('.checkboxes').each(function(d) {
            d3.select(this).property('checked',true)
        })
        update()
    })

    function onDropdown() {
        var selectedVal = d3.select('select').node().value
        var sortedValues = Object.keys(lookup[selectedVal]).sort()

        d3.selectAll('.figures').transition().style('display','block')

        $('#checkboxes').empty()

        d3.select('#checkboxes')
            .selectAll("input")
            .data(sortedValues)
            .enter()
            .append('label')
            .attr('for', function (d, i) { return 'a' + i; })
            .text(function (d) { return d; })
            .append("input")
            .attr('class', 'checkboxes')
            .attr("checked", true)
            .attr('name','checkbox')
            .attr("type", "checkbox")
            .attr("id", function (d) { return lookup[selectedVal][d] })
        d3.selectAll(".checkboxes").on("change",update);
    }
    
    function update() {
        var show = []; var hide = [];
        var selectedDD = d3.select('select').node().value

        d3.selectAll('.checkboxes').each(function(d) {
            var isChecked = d3.select(this).property('checked')
            if (isChecked) {
                show.push(d)
            } else {
                hide.push(d)
            }
        })

        d3.selectAll('.figures').each(function() {
            var figure = d3.select(this)
            var src = figure.select('img').attr('src')
            var splitsrc = src.replace('.jpg','').replace('.png','').split('/')
            var folder = splitsrc[0]
            var fileInfoSplit = splitsrc[1].split('0')
            var catObj = Object()
            fileInfoSplit.forEach(function(cat) {
                var splitcat = cat.split('-')
                var lookupKey = splitcat[0]
                var subcats = splitcat[1]
                var splitsubcats = subcats.split('_')
                if (splitsubcats[0] == "") {
                    catObj[lookupKey] = 'Other'
                } else {
                    catObj[lookupKey] = splitsubcats
                }
            })
            hide.forEach(function(h) {
                var figureCats = catObj[selectedDD[0]]
                if (figureCats != null) {
                    var checkboxAbbrev = lookup[selectedDD][h]
                    if (figureCats.includes(checkboxAbbrev)) {
                        figure.transition().style('display','none')
                    }
                }
            })
            show.forEach(function(s) {
                var figureCats = catObj[selectedDD[0]]
                if (figureCats != null) {
                    var checkboxAbbrev = lookup[selectedDD][s]
                    console.log(figureCats, checkboxAbbrev)
                    if (figureCats.includes(checkboxAbbrev)) {
                        console.log('INCLUDES!')
                        figure.transition().style('display','block')
                    }
                }
            })
        })
    }

    onDropdown()
}