import React, { Component, Fragment } from 'react';
import "./animation.css";


class Animation extends Component {
    constructor(props) {
        super(props);
        this.width = props.width;
        this.height = props.height;
        this.custom_width = "276px";
    }

    render() {
        return (
			<div className="loading-animation" style={{ '--width': this.width, '--height': this.height, '--custom-width': this.custom_width }}>
				<div className="inside-loading-animation"></div>
			</div>
        );
    }
}

export default Animation;