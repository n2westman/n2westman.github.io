import "./Uploader.css";
import loadImage from "./loadImage";

import React from "react";

class Uploader extends React.Component {

  handleFileSelect(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  render() {
    return (
      <>
        <div className="Uploader">
          <input
            onChange={this.handleFileSelect}
            type="file"
            id="file"
            name="file"
          ></input>
        </div>

        <div>
          <h3>
            Original image (h<span id="h"></span>, w<span id="w"></span>)
          </h3>
          <canvas id="original"></canvas>
        </div>
        <div>
          <div className="il">
            <h4>Energy</h4>
            <canvas id="energy"></canvas>
          </div>
          <div className="il">
            <h4>Seam</h4>
            <canvas id="seam"></canvas>
          </div>
        </div>
        <p>
          Processing took <span id="duration"></span>ms
        </p>
      </>
    );
  }
}

export default Uploader;
