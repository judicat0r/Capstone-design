var serverAddress = 'http://localhost:3000';
var currentQuery = 'The quick brown fox jumped over the lazy dog.';
var start_num = 1;
var flag = 0;

		// Submit on clicking the 'submit' button
		$('#submit').click(function() {

			var APIKEY = 'AIzaSyA6ugyzEKC_nvyRNTt4hx7GemNIiMsLI7E';
			var cardnumber = 1;
			currentQuery = $('#text').val();
			if(currentQuery.trim() == '') {
				currentQuery = 'The quick brown fox jumped over the lazy dog.';
			}
			$('#text').val(currentQuery);

			reset();
			$('#submit').addClass('loading disabled');
			$('#submit').prop('disabled', true);
			$('#results').show();
			$('#result_load').show();
			
			
			//Run Query
			$.ajax({
				type: 'POST',
				url: "https://language.googleapis.com/v1/documents:analyzeEntitySentiment?key="+APIKEY,
				data: JSON.stringify({
		        	document: {
		        		type: 'PLAIN_TEXT',
		        		content: currentQuery
		        	},
		        	encodingType: 'UTF8'
		        }),
				contentType : "application/json",
				success: function(data) {
					
					$('#submit').prop('disabled', true);
					$('#submit').removeClass('loading disabled');
					$('#result_load').hide();
					$('#images').show();
					$('#image_load').show();

					if(typeof data === 'undefined' || data.language == undefined) {
						$('#errors').find('.header').text('Failed to reach server!');
						$('#errors').find('p').text('Try again!');
						$('#errors').show();
					}
					for(var i=0; i < data.entities.length; i++){
						$('#cards').append(createCard(data.entities[i]));
					}

					var mycx = '007526155420820886852:bqp7pd3j43c';
					
					$.ajax({
						url: "https://www.googleapis.com/customsearch/v1",
						data: {
							key: APIKEY,
							cx: mycx,
							q: data.entities[0].name,
							searchType: 'image',
							safe: 'high',
							start: start_num
						},
						success: function(data2) {
							//$('#pics').empty();
							flag = 1;
							var t = data.entities[0].name;
							$('#image_load').hide();
							makeImage(data2);
							$('#more').show();
							
							$('#images').visibility({
									once: false,
									observeChanges: true,									
									onBottomVisible: function() {
										
										if(flag == 1) {
											start_num += 10;
											$.ajax({
											url: "https://www.googleapis.com/customsearch/v1",
											data: {
												key: APIKEY,
												cx: mycx,
												q: t,
												searchType: 'image',
												safe: 'high',
												start: start_num
											},
											success: function(data) {
												makeImage(data);
											},
											error: function(error) {
												$('#more').hide();
											}
										});
										}
									}
								});
						},
						dataType: 'json'
					});
				},
				error: function(error) {
					$('#errors').find('.header').text('Failed to reach server!');
					$('#errors').find('p').text('Try again!');
					$('#errors').show();
				}
			});

			function createCard(entity) {

				var card = $('<div class="card">').append($('<div class="content">'));
				var content = card.children().append($('<span>', {
					class: 'ui right ribbon label',
					text: entity.type
				}));
				

				switch(entity.type) {
					case 'ORGANIZATION': content.children().first().addClass('red');break;
					case 'PERSON': content.children().first().addClass('orange');break;
					case 'LOCATION': content.children().first().addClass('yellow');break;
					case 'EVENT': content.children().first().addClass('green');break;
					case 'WORK_OF_ART': content.children().first().addClass('blue');break;
					case 'CONSUMER_GOOD': content.children().first().addClass('brown');break;
					case 'OTHER': content.children().first().addClass('teal');break;
					default: content.children().first().addClass('black');break;
				}

				content.append($('<div>', {
					class: 'header',
					text: cardnumber + ". " + entity.name.charAt(0).toUpperCase() + entity.name.substring(1,entity.name.length)
				}));
				cardnumber++;
				if(!($.isEmptyObject(entity.metadata))) {
					content.append($('<a>', {
						class: 'meta',
						text: 'Wikipedia Article',
						href: entity.metadata.wikipedia_url,
						target: '_blank'
					}));
				}
				content.append($('<div class="description">'));
				var description = content.find('.description');
				description.append($('<h5>Sentiment:</h5><div class="ui blue labels"><span class="ui label">Score<div class="detail">' + entity.sentiment.score +'</div></span><span class="ui label">Magnitude<div class="detail">' + entity.sentiment.magnitude + '</div></span></div>'));

				card.append($('<div class="extra content"><div class="ui label">Salience<div class="detail">' + entity.salience.toFixed(3) + '</div></div></div>'));

				return card;
			}
		});

		function reset() {
			$('#errors').hide();
			$('#results').hide();
			$('#cards').empty();

			$('#images').hide();
			$('#more').hide();
			$('#pics').empty();

			start_num = 1;
			flag = 0;
		}

		function makeImage(data) {
			console.log(start_num);
			$.each(data.items, function(index, item) {
				src = item.image.thumbnailLink;
				title = item.title;

				img = $("<img>").attr({
					
					src: src,
					title: title,
					height: '100%',
					width: '100%'
				});

				var div = $('<div class="column"></div>');
				img.appendTo(div);
				$('#pics').append(div);


			});
		}


		