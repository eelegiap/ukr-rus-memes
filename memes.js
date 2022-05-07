// A $( document ).ready() block.
$(document).ready(function () {
    console.log("ready!")

    d3.json('fileData.json', function (fileData) {
        d3.json('categories.json', function (lookupData) {
            initialize(lookupData, fileData)
        })
    })
});

function initialize(lookup, data) {

    var folders = ['View All Sources']
    data.forEach(function (folder, j) {
        j = j + 1
        folders.push(folder['folder'])

        folder.files.forEach(function (file, i) {
            var whichCol = Math.floor(i % 4)
            var colID = `#col${whichCol}`
            var categories = file.categories

            var figure = d3.select(colID)
                .append('figure')
                .attr('class', 'figures')
                .style('padding-bottom', '20px')
                .style('display', 'show')

            figure.append('img')
                .attr('id', `thumbnail-${j}-${i}`)
                .attr('class', 'image')
                .attr('src', `${folder['folder']}/${file.fileName}`)
                .style('width', '100%')
            figure.append('figcaption')
                .text(folder['folder'])
                .style('color', '#ccc')
                .style('font-size', '10px')

            d3.select('#modals').append('div')
                .attr('id', `modal${j}-${i}`)
                .attr('class', 'modal')
                .style('opacity', 1)
                // .append('span').attr('class', 'close').html('&times;')
                .append('img').attr('class', 'modal-content').attr('id', `img${j}-${i}`)

            var modal = document.getElementById(`modal${j}-${i}`);

            // Get the image and insert it inside the modal - use its "alt" text as a caption
            var img = document.getElementById(`thumbnail-${j}-${i}`);
            var modalImg = document.getElementById(`img${j}-${i}`);
            img.onclick = function () {
                modal.style.display = "block";
                modalImg.src = this.src;
            }

            $(`#modal${j}-${i}`).click(function (e) {
                $(`#modal${j}-${i}`).hide();
            });
        })
    })

    var defaultOptionName; // desired default dropdown name
    d3.select("#dropdown").append("select")
        .on("change", onDropdown)
        .selectAll("option").data(Object.keys(lookup))
        .enter().append("option")
        .attr("value", function (d) { return d; })
        .text(function (d) { return d; })
    d3.select('#dropdown select').property('value', 'Stance')

    d3.select("#source").append("select")
        .on("change", sourceChange)
        .selectAll("option").data(folders)
        .enter().append("option")
        .attr("value", function (d) { return d; })
        .text(function (d) { return d; })

    d3.select('#source select').property('value', 'View All Sources')

    function sourceChange() {
        var selectedSrc = d3.select('#source select').node().value

        update()

        if (selectedSrc == 'View All Sources') {
            d3.selectAll('.figures').each(function () {
                d3.select(this).style('display', 'block')
            })
        } else {
            const selectedIdx = (d) => d == selectedSrc;
            var selectedJ = folders.findIndex(selectedIdx)
            d3.selectAll('.figures').each(function () {
                var figID = d3.select(this).select('img').attr('id')
                var thisJ = figID.split('-')[1]
                if (selectedJ == thisJ) {
                    d3.select(this).style('display', 'block')
                } else {
                    d3.select(this).style('display', 'none')
                }
            })
        }
    }
    d3.select('#clearAll').on('click', function () {
        d3.selectAll('.checkboxes').each(function (d) {
            d3.select(this).property('checked', false)
        })
        update()
    })
    d3.select('#showAll').on('click', function () {
        d3.selectAll('.checkboxes').each(function (d) {
            d3.select(this).property('checked', true)
        })
        update()
    })

    function onDropdown() {

        var selectedVal = d3.select('#dropdown select').node().value
        var sortedValues = Object.keys(lookup[selectedVal]).sort()

        if (selectedVal == 'Template') {
            d3.select('#memeCols').style('padding-top','30vh')
        }
        d3.selectAll('.figures').transition().style('display', 'block')

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
            .attr('name', 'checkbox')
            .attr("type", "checkbox")
            .attr("id", function (d) { return lookup[selectedVal][d] })
        d3.selectAll(".checkboxes").on("change", update);
    }

    function update() {
        var show = []; var hide = [];
        var selectedDD = d3.select('select').node().value

        d3.selectAll('.checkboxes').each(function (d) {
            var isChecked = d3.select(this).property('checked')
            if (isChecked) {
                show.push(d)
            } else {
                hide.push(d)
            }
        })

        d3.selectAll('.figures').each(function () {
            var figure = d3.select(this)
            var src = figure.select('img').attr('src')
            var splitsrc = src.replace('.jpg', '').replace('.png', '').split('/')
            var folder = splitsrc[0]
            var fileInfoSplit = splitsrc[1].split('0')
            var catObj = Object()
            fileInfoSplit.forEach(function (cat) {
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
            hide.forEach(function (h) {
                var figureCats = catObj[selectedDD[0]]
                if (figureCats != null) {
                    var checkboxAbbrev = lookup[selectedDD][h]
                    if (figureCats.includes(checkboxAbbrev)) {
                        figure.transition().style('display', 'none')
                    }
                }
            })
            show.forEach(function (s) {
                var figureCats = catObj[selectedDD[0]]
                var selectedSrc = d3.select('#source select').node().value
                if (selectedSrc != 'View All Sources') {
                    const selectedIdx = (d) => d == selectedSrc;
                    var selectedJ = folders.findIndex(selectedIdx)
                    var figID = figure.select('img').attr('id')
                    var thisJ = figID.split('-')[1]
                    if (selectedJ != thisJ) {
                        figure.transition().style('display','none')
                    } else {
                        if (figureCats != null) {
                            var checkboxAbbrev = lookup[selectedDD][s]
                            if (figureCats.includes(checkboxAbbrev)) {
                                figure.transition().style('display', 'block')
                            }
                        }
                    }
                } else {
                    if (figureCats != null) {
                        var checkboxAbbrev = lookup[selectedDD][s]
                        if (figureCats.includes(checkboxAbbrev)) {
                            figure.transition().style('display', 'block')
                        }
                    }
                }
            })
        })
    }

    onDropdown()
}