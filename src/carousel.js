import View from './view';

export default class Carousel extends View {

	constructor(rootNodeId, carouselItems) {
		super(rootNodeId);

		if (carouselItems && carouselItems.length > 0) {
			this.startTheCarousel(carouselItems);
		}
	}

	startTheCarousel(items) {

		this.items = items;

		// Create the event.
		this.nextItemEvent = document.createEvent('Event');
		this.nextItemEvent.initEvent('nextItem', true, true);

		this.index = 0;

		// Append the first item to DOM
		this.currentItem = this.renderViewItem(this.items[this.index]);
		this.currentItem.style.left = '0';
		this.appendViewItemsToDOM(this.currentItem);


		if (this.items.length > 1) {

			this.addArrowsAndPositionIndicator();

			// Add the next item to be ready to change
			this.nextItem = this.renderViewItem(this.items[1]);
			this.nextItem.style.left = '100%';
			this.appendViewItemsToDOM(this.nextItem);

			// Add previous item for manual changing
			this.previousItem = this.renderViewItem(this.items[this.items.length - 1]);
			this.previousItem.style.left = '-100%';
			this.appendViewItemsToDOM(this.previousItem);

			// Listen to nextItem events
			this.rootNode.addEventListener('nextItem', this.displayNextItem.bind(this));

			// Bind the arrows to listen mousedown
			this.leftArrowNode.addEventListener('mousedown',
					this.displayPreviousItem.bind(this));
			this.rightArrowNode.addEventListener('mousedown',
					this.displayNextItem.bind(this));

			// Start a timer to change to the next item in a set time
			this.setNextItemTimer();

		}
	}

	addArrowsAndPositionIndicator() {

		// Arrows to change the item manually
		this.leftArrowNode = document.createElement('i');
		this.leftArrowNode.className = 'fa fa-chevron-left carousel-arrow-left';
		this.rightArrowNode = document.createElement('i');
		this.rightArrowNode.className = 'fa fa-chevron-right carousel-arrow-right';

		// A indicator to easily see how many ads there is
		this.positionIndicator = document.createElement('div');
		this.positionIndicator.className = 'carousel-position-indicator';
		let additionalCircles = '';
		for (let i = 2; i < this.items.length; i++) {
			additionalCircles += '\n<i class="fa fa-circle-o"></i>';
		}
		this.positionIndicator.innerHTML = `
			<i class="fa fa-circle"></i>
			<i class="fa fa-circle-o"></i>
			${additionalCircles}`;

		// Add carousel arrows and indicator circles to the rootNode
		this.rootNode.appendChild(this.leftArrowNode);
		this.rootNode.appendChild(this.rightArrowNode);
		this.rootNode.appendChild(this.positionIndicator);

		this.positionCircles = this.positionIndicator.getElementsByClassName('fa');
	}

	displayNextItem() {
		this.clearNextItemTimer();

		if (!this.checkOnHoldStatus()) {
			return;
		}

		// Move the items (current out, next one in)
		this.currentItem.style.left = '-100%';
		this.nextItem.style.left = '0';

		// Make the previous (index has not been increased yet) position
		// indicator to empty circle
		this.positionCircles[this.index].className = 'fa fa-circle-o';


		// Increase index and check if it goes to the beginning
		this.index++;
		this.index = this.checkOverIndex(this.index);

		// Update the current position indicator to the full circle
		this.positionCircles[this.index].className = 'fa fa-circle';

		this.rootNode.removeChild(this.previousItem);

		// Assign new node order
		this.previousItem = this.currentItem;
		this.currentItem = this.nextItem;

		let next = this.checkOverIndex(this.index + 1);
		this.nextItem = this.renderViewItem(this.items[next]);
		this.nextItem.style.left = '100%';
		this.appendViewItemsToDOM(this.nextItem);

		this.setNextItemTimer();
	}

	displayPreviousItem() {

		this.clearNextItemTimer();

		if (!this.checkOnHoldStatus()) {
			return;
		}

		this.currentItem.style.left = '100%';
		this.previousItem.style.left = '0';

		// Make the previous (index has not been decreased yet) position
		// indicator to empty circle
		this.positionCircles[this.index].className = 'fa fa-circle-o';

		// Decrease the index and check if it goes to the end
		this.index--;

		this.index = this.checkUnderIndex(this.index);

		// Update the current position indicator to the full circle
		this.positionCircles[this.index].className = 'fa fa-circle';

		this.rootNode.removeChild(this.nextItem);

		// Assign new node order
		this.nextItem = this.currentItem;
		this.currentItem = this.previousItem;


		let previous = this.checkUnderIndex(this.index - 1);
		this.previousItem = this.renderViewItem(this.items[previous]);
		this.previousItem.style.left = '-100%';
		this.appendViewItemsToDOM(this.previousItem);

		this.setNextItemTimer();
	}

	// Set a timer which eventually triggers nextItemEvent
	setNextItemTimer() {
		this.timeOutId = setTimeout(() => {
			this.rootNode.dispatchEvent(this.nextItemEvent);
		}, 8000);
	}

	// Interrutp the timeout set in the setNextItemTimer()
	clearNextItemTimer() {
		clearTimeout(this.timeOutId);
	}

	// The isOnHold-check is to make sure that the item cannot be changed too
	// rapidly, but only after a short timeout to avoid stupid looking change
	// animation
	checkOnHoldStatus() {

		if (this.isOnHold) {
			return false;
		}

		this.isOnHold = true;

		setTimeout(() => {
			this.isOnHold = false;
		}, 700);

		return true;
	}

	checkOverIndex(index) {
		if (index >= this.items.length) {
			return 0;
		}
		return index;
	}

	checkUnderIndex(index) {
		if (index < 0) {
			return this.items.length - 1;
		}
		return index;
	}
}
