import View from './view';
import resource from './resource';

export default class Calendar extends View {

	constructor(rootNodeId, apiUrl) {
		let apiOpts = [{name: 'getEvents', method: 'GET', url: apiUrl}];
		super(rootNodeId, apiOpts);

		// Initialize calendar to the current month (and year)
		let date = new Date();
		this.setDate(date);

		// Properties to be used in marking the current day in view
		this.actualMonth = date.getMonth();
		this.currentDay = date.getDate();
	}

	// Render the calendar for the current month (this.currentMonth)
	setCalendarView(events) {
		let calendarMatrix = this.createCalendarMatrix(events);
		this.setSingleItemView(calendarMatrix);
	}

	setDate(date) {
		this.currentMonth = date.getMonth();
		this.currentYear = date.getFullYear();
	}

	changeToNextMonth() {
		this.currentMonth++;
		let date = new Date(this.currentYear, this.currentMonth);
		this.setDate(date);
		let queryString = this.getApiQueryString();
		this.api.getEvents(queryString).then(events => {
			this.setCalendarView(events);
		});
	}

	changeToPreviousMonth() {
		this.currentMonth--;
		let date = new Date(this.currentYear, this.currentMonth);
		this.setDate(date);
		let queryString = this.getApiQueryString();
		this.api.getEvents(queryString).then(events => {
			this.setCalendarView(events);
		});
	}

	// Useful for fetching calendar data from RESTful apis
	getApiQueryString() {
		return '?year=' + this.currentYear + '&month=' + (this.currentMonth + 1);
	}

	// Creates a m x n calendar matrix, where m is the amount of weeks visible in the
	// month and n is the days in a week. The matrix is configured for the
	// currentMonth. The events are attached to their corresponding dates in the
	// matrix.
	createCalendarMatrix(events) {

		/*
		 *	Phase 1: Get the needed date information
		 */

		let currentMonthFirstDate = new Date(this.currentYear, this.currentMonth, 1);
		let currentMonthLastDate = new Date(this.currentYear, this.currentMonth + 1, 0);

		// Get the last day for current month
		let currentMonthLastDay = currentMonthLastDate.getDate();
		let previousMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();

		// Get the weekday of the first and the last day in the month (0-6)
		let firstWeekday = this._adjustWeekdayToNormalWeek(currentMonthFirstDate.getDay());
		let lastWeekday = this._adjustWeekdayToNormalWeek(currentMonthLastDate.getDay());

		// Calculate the number of weeks needed to display current month
		let daysInView = currentMonthLastDay + firstWeekday + (6 - lastWeekday);
		let weeksInView = daysInView / 7;

		/*
		 *	Phase 2 - Map events to array
		 */

		// Create a mappedEvents array where the indices match the dates of the
		// current month (from 1 to currenMonthLastDay)
		let mappedEvents = [];
		for (let i = 1; i <= currentMonthLastDay; i++) {
			mappedEvents[i] = [];
		}

		// Map all the events to their dates in the mappedEvents-array
		if (events && events.length > 0) {
			events.forEach(event => {

				// Make a Date instance out of the timestamps
				let start = new Date(event.start);
				let end = new Date(event.end);

				// Case: event has started in the last year but goes on in the current
				// Case: event has started in the last month but goes on in the current
				if (start.getFullYear() < this.currentYear ||
						start.getMonth() < this.currentMonth) {

					// Make the first day of the month as the new start date for the event
					start = new Date(this.currentYear, this.currentMonth, 1);
				}

				let startDate = start.getDate();
				let endDate = end.getDate();
				let startMonth = start.getMonth();
				let endMonth = end.getMonth();

				// Case: event lasts to the next month
				if (startMonth < endMonth) {
					// Add the event to all days left in the month
					for (let i = startDate; i <= this.currenMonthLastDay; i++) {
						mappedEvents[i].push(event);
					}

				// Case: A single day event, or the event lasts past the start date
				} else if (startDate <= endDate) {

					// Add event to all days from start date to end date
					for (let i = startDate; i <= endDate; i++) {
						mappedEvents[i].push(event);
					}

				}
			});
		}

		/*
		 *	Phase 3 - Create a calendar matrix
		 */

		// A counter to tell when the dates in the matrix will be from previous,
		// current or the next month (if < 1 => previous month, > last day in month
		// => next month, else current month)
		let dateCounter = 1 - firstWeekday;

		// Form the event matrix which represenst all the days and their events
		// visible in the current month view. m represents weeks, n days in a week
		let calendarMatrix = [];
		for (let m = 0; m < weeksInView; m++) {

			calendarMatrix[m] = [];

			for (let n = 0; n < 7; n++) {

				if (dateCounter < 1) {
					calendarMatrix[m][n] = {
						date: previousMonthLastDay + dateCounter,
						isNotInCurrentMonth: true
					};

				} else if (dateCounter > currentMonthLastDay) {
					calendarMatrix[m][n] = {
						date: dateCounter - currentMonthLastDay,
						isNotInCurrentMonth: true
					};

				} else {

					//  Sort dates (earliest first)
					let events = mappedEvents[dateCounter];
					events.sort((a, b) => {
						return new Date(a.start) - new Date(b.start);
					});

					calendarMatrix[m][n] = {
						date: dateCounter,
						events
					};

				}

				dateCounter++;
			}
		}

		return calendarMatrix;

	}

	// Javascript's Date's getDay()-function returns 0-6 where Sunday is 0. Murica!
	// This function makes this right for the rest of the world (Monday = 0)
	_adjustWeekdayToNormalWeek(day) {
		if (day === 0) {
			return 6;
		} else {
			return day - 1;
		}
	}

}
