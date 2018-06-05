var APIKEY = 'AIzaSyA6ugyzEKC_nvyRNTt4hx7GemNIiMsLI7E';
var mycx = '007526155420820886852:bqp7pd3j43c';
var NLP_URI = "https://language.googleapis.com/v1/documents:analyzeEntitySentiment?key=";
var duplicate = {};

$(document).ready(function () {
    $('#attachment').change(function (event) {
        var target = event.target || event.srcElement;
        if(target.value.length != 0)
            setText();
    });
  
    $('#view').click(function () {
        $('.main').hide();
        viewBook();
    });
    
    $('.close.icon').click(function () {
        $('#error').transition('slide down');
    });
});

function setText() {
        $('#textarea').val('');
        var reader = new FileReader();
        reader.readAsText(document.getElementById('attachment').files[0]);
        reader.onload = function(rEvent) {
        var string = rEvent.target.result;
        string = string.replace(/\n/g, " ");
        string = string.replace(/\r/g, " ");
        document.getElementById("textarea").value = string;
        };
    }
function splitString(string) {
        var max = 1270;
        var arr = [];
        var paragraph = [];
        var regex = /([\.\?!][\'\"\u2018\u2019\u201c\u201d\)\]]*\s*(?<!\w\.\w.)(?<![A-Z][a-z][a-z]\.)(?<![A-Z][a-z]\.)(?<![A-Z]\.)\s+)/;
        var list = string.split(regex);
        var str = "";
        for(var i = 0, j = list.length; i < j; i += 2) {
                arr[i] = list[i] + (list[i+1] ? list[i+1] : "");
                if(str.length + arr[i].length < max) {
                    str += arr[i];
                }
                else {
                    paragraph.push(str);
                    str = "";
                    str += arr[i];
                }
        }
        paragraph.push(str);
        return paragraph;
    }
function getMain(story) {
        
        $.ajax({
            type: 'POST',
            url: NLP_URI + APIKEY,
            data: JSON.stringify({
                document: {
                    type: 'PLAIN_TEXT',
                    content: story
                },
                encodingType: 'UTF8'
            }),
            async: false,
            contentType: 'application/json',
            success: function (data) {
                $(".flipbook").append(createStory(story));
                var index = checkduplicate(data.entities[0].name);
                getImage(data.entities[0].name + " " + $('#title').val(), index);
            }
        });
    }
function createStory(story) {
        var paragraph = $("<div class='txt'><p>" + story + "</p></div>");
        return paragraph;
}

function getImage(name, index) {
        
        $.ajax({
            url: "https://www.googleapis.com/customsearch/v1",
            data: {
                key: APIKEY,
                cx: mycx,
                q: name,
                searchType: 'image',
                safe: 'high',
            },
            async: false,
            success: function(data) {                
                url = data.items[index].link;
                var div = $('<div style="background-image:url(' + url + ')">');
                $('.flipbook').append(div);
                
            },
        });
    }
function viewBook() {
        var currentQuery = $('#textarea').val();
        var $progress = $('.progress');
        currentQuery = currentQuery.replace(/\n/g, " ");
        currentQuery = currentQuery.replace(/\r/g, " ");
    
        if(currentQuery.trim() == '' && $('#error').hasClass('hidden')) {
            $("#error").transition('slide down');
            return;
        }

        currentQuery = splitString(currentQuery); // Query is array.
       
        var j = currentQuery.length;
        for(var i = 0; i < j; ++i) {
            var story = currentQuery[i];
            getMain(story);
        }
        $('.flipbook').append('<div style="background-image:url(../img/last.jpg)"></div>');                  
        yepnope({
            test: Modernizr.csstransforms,
            yep: ['../js/turn.js'],
            nope: ['../js/turn.html4.min.js'],
            both: ['../css/Bookbasic.css'],
            complete: loadApp
        });
            $('.test').toggle();
}    
function loadApp() {
    $('.flipbook').turn({
        
        width: 922,
        height: 600,
        elevation: 50,
        gradients: true,
        autoCenter: true
    });
}

function checkduplicate(context) {
    if(duplicate[context] === undefined) {
        duplicate[context] = 0;
    }
    else {
        duplicate[context] += 1;
    }
    return duplicate[context];
}