import "./Uploader.css";
import { populateImage } from "./loadImage";

import React from "react";

class Uploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      isButtonDisabled: true,
      iter: 50,
    };
  }

  loadImage(src, isMask) {
    const $image = new Image();
    $image.crossOrigin = "Anonymous";
    $image.onload = () => {
      if (isMask) {
        this.setState({
          isButtonDisabled: !this.state.image,
          mask: $image
        });
        return;
      }

      this.setState({
        isButtonDisabled: false,
        image: $image,
      });
    };
    $image.src = src;
  }

  handleFileSelect(e, isMask) {
    const file = e.target.files[0];
    const reader = new FileReader();

    this.setState({
      isButtonDisabled: true,
    });

    reader.onload = (e) => {
      this.loadImage(e.target.result, isMask);
    };
    reader.readAsDataURL(file);
  }

  processImage(e) {
    populateImage(this.state.image, this.state.iter, this.state.mask);
  }

  handleChange = (e) => {
    this.setState({
      iter: e.target.value
    })
  }

  render() {
    return (
      <>
        <div className="Uploader">
        <div className="option">
            <input type="number" id="iter" name="iter" value={this.state.num} onChange={(e) => this.handleChange(e)}></input>
            <label htmlFor="horizontal">Number of iterations</label>
          </div>
          <div className="option">
            <input type="checkbox" id="horizontal" name="horizontal"></input>
            <label htmlFor="horizontal">Horizontal?</label>
          </div>
          <div className="option">
            <input type="checkbox" id="addSeams" name="addSeams"></input>
            <label htmlFor="addSeams">Add Seams?</label>
          </div>
          <div className="option">
            <label htmlFor="file">Image</label>
            <input
              onChange={(e) => this.handleFileSelect(e)}
              type="file"
              id="file"
              name="file"
            ></input>
          </div>
          <div className="option">
            <label htmlFor="file">Image Mask (Optional)</label>
            <input
              onChange={(e) => this.handleFileSelect(e, true)}
              type="file"
              id="maskFile"
              name="maskFile"
            ></input>
          </div>
          <button
            onClick={(e) => this.processImage()}
            type="button"
            disabled={this.state.isButtonDisabled}
          >
            Start
          </button>
        </div>

        <div>
          <h3>
            Original image (h<span id="h"></span>, w<span id="w"></span>)
          </h3>
          <canvas id="original"></canvas>
        </div>
        <div>
          <h3>
            Mask
          </h3>
          <canvas id="mask"></canvas>
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
