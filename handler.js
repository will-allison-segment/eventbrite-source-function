// Learn more about source functions API at
// https://segment.com/docs/connections/sources/source-functions

/**
 * Handle incoming HTTP request
 *
 * @param  {FunctionRequest} request
 * @param  {FunctionSettings} settings
 */
async function onRequest(request, settings) {
	const body = request.json();
	var token = settings.privateToken;
	var order_info;
	var order_url = body.api_url;
	var headers = {
		Authorization: 'Bearer ' + token
	};

	//Get the Track Event Name
	var event_name;
	var event;
	if (body.config.action == 'order.placed') {
		event = 'Ticket Ordered';
	} else if (body.config.action == 'order.refunded') {
		event = 'Ticket Refunded';
	}

	if (
		body.config.action == 'order.placed' ||
		body.config.action == 'order.refunded'
	) {
		await fetch(order_url, {
			method: 'GET',
			headers: headers
		})
			.then(res => res.json())
			.then(res => {
				order_info = res;
			});

		events_url =
			`https://www.eventbriteapi.com/v3/events/` + order_info.event_id;
		await fetch(events_url, {
			method: 'GET',
			headers: headers
		})
			.then(res => res.json())
			.then(res => {
				event_name = res.name.text;
			});

		const email = order_info.email;
		/*
		//Hash email for anonId
		const hashEmail = str => {
			let hash = 0;
			let i;
			let chr;
			for (i = 0; i < str.length; i++) {
				chr = str.charCodeAt(i);
				hash = (hash << 5) - hash + chr;
				hash |= 0; // Convert to 32bit integer
			}
			return hash;
		};
		let anonymousId = hashEmail(email);
*/
		//pull traits from the order API request, anonId is hashed email
		Segment.identify({
			anonymousId: btoa(email),
			traits: {
				email: order_info.email,
				name: order_info.name
			}
		});

		Segment.track({
			event: event,
			anonymousId: btoa(email),
			properties: {
				event_id: order_info.event_id,
				event_name: event_name,
				//revenue is the dollar amount
				revenue: order_info.costs.gross.major_value,
				//costs is a set up objects breaking down where the revenue came from: https://www.eventbrite.com/platform/api#/reference/attendee
				costs: order_info.costs
			}
		});
	}
}
