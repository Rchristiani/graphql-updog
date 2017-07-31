const updog = {};

function queryGraphQL(type,query) {
	const queryParams = new URLSearchParams();
	queryParams.append(type,query);
	if(type === 'query') {
		return fetch(`http://localhost:4000/graphql?${queryParams.toString()}`,{
			method: 'GET'
		})
		.then(res => res.json())
	}
	else {
		return fetch(`http://localhost:4000/graphql`,{
			method: 'POST',
			body: `${type} ${query}`,
			headers: {
				'Content-Type': 'application/graphql'
			}
		})
		.then(res => res.json())
	}
	
}

updog.getDogs = () => queryGraphQL('query',`{
	allDogs {
		_id
		name
		photo
		description
		score
	}
}`);


updog.createDog = (data) => queryGraphQL('mutation',`{
	createDog(
		name: "${data.name}"
		photo: "${data.photo}"
		description: "${data.description}"
	){
		name
	}
}`)

updog.deleteDog = (id) => queryGraphQL('mutation', `{
	deleteDog(_id: "${id}") {
		name
	}
}`)

updog.upvote = (id) => queryGraphQL('mutation',`{
	updateDog(_id: "${id}") {
		name
	}
}`)

updog.displayDogs = (dogs) => {
	$('#dogos').empty();
	dogs.forEach((dog) => {
		const $container = $("<div>").addClass('dogo');
		const $close = $('<i>').addClass('fa fa-times').data('id',dog._id);
		const $img = $('<img>').attr('src',dog.photo);
		const $name = $('<h3>').text(dog.name);
		const $desc = $('<p>').text(dog.description);
		const $scoreContainer = $('<div>').addClass('score-container');
		const $score = $('<p>').text(dog.score).addClass('score');
		const $thumb = $('<p>').text('👍').addClass('updog').data('id',dog._id);
		$scoreContainer.append($score,$thumb);
		$container.append($close,$img,$name,$desc,$scoreContainer);
		$('#dogos').append($container);
	})
};

updog.events = () => {
	$('.add-dogo form').on('submit',(e) => {
		e.preventDefault();
		const dog = {
			name : $('#name').val(),
			description: $('#description').val(),
			photo: $('#photo').val()
		}
		updog.createDog(dog)
			.then(() => $('.add-dogo').toggleClass('show'))
			.then(updog.getDogs)
			.then(dogs => dogs.data.allDogs)
			.then(updog.displayDogs)
	});

	$('.toggle-dogo').on('click',() => {
		$('.add-dogo').toggleClass('show');
	});

	$('#dogos').on('click', '.updog' ,function() {
		const id = $(this).data('id');
		updog.upvote(id)
			.then(updog.getDogs)
			.then(dogs => dogs.data.allDogs)
			.then(updog.displayDogs);
	});

	$('#dogos').on('click', '.fa-times', function() {
		updog.deleteDog($(this).data('id'))
			.then(updog.getDogs)
			.then(dogs => dogs.data.allDogs)
			.then(updog.displayDogs);
	})
};

updog.init = () => {
	updog.getDogs()
		.then(dogs => dogs.data.allDogs)
		.then(updog.displayDogs);
	updog.events();
};

$(updog.init);