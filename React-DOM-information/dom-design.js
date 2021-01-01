
class DOM_DESIGN {
    constructor( element, start = false, obj = { clicked: false } ) {
        this.element = element;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.start = start;
        this.clickAbleEvent = obj.clicked
    }
    
    startCounting() {
        if ( this.start ) {
            throw new Error("Element is already been counting");
        } else {
            this.start = true;
        }
    }

    stopCounting() {
        if ( this.start ) {
            this.start = false;
        } else {
            throw new Error("Element is already stopped counting");
        }
    }

    getMeasure() {
        if ( this.start ) {
            return { width: (this.element.clientWidth), height: (this.element.clientHeight), y: (this.element.offsetTop), x: (this.element.offsetLeft), counting_position: "TOP LEFT" };
        } else throw new Error("Element counting isn't get started!");
    }

    isClickInside( val ) {
        if ( this.start ) {
            const thisObject = this;
            if ( this.clickAbleEvent ) {
                window.addEventListener("click", function(e) {

                    if ( (thisObject.element.offsetLeft <= e.clientX) && ( (thisObject.element.offsetLeft + thisObject.element.clientWidth) >= e.clientX ) && ( thisObject.element.offsetTop <= e.clientY ) && ( (thisObject.element.offsetTop + thisObject.element.clientHeight) >= e.clientY ) ) {
                        val( { inside: true, outside: false } );
                    } else {
                        val( { inside: false, outside: true } );
                    }
                });
                
            } else throw new Error("Click Event is not Started");
        } else throw new Error("Element counting isn't get started!");
    }
}

export default DOM_DESIGN;