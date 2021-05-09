// From https://jsfiddle.net/nicolaspanel/047gwg0q/
import nj from "numjs";
import { removeSeams, addSeams } from "./seams";

export function populateImage($image) {
  const img = nj.images.read($image).slice(null, null, [3]);

  // display images in canvas
  const $original = document.getElementById("original");
  $original.width = img.shape[1];
  $original.height = img.shape[0];
  nj.images.save(img, $original);

  const horizontalCheckbox = document.querySelector(
    "input[type=checkbox][name=horizontal]"
  );
  const horizontal = horizontalCheckbox.checked;

  const addSeamsCheckbox = document.querySelector(
    "input[type=checkbox][name=addSeams]"
  );
  const shouldAddSeams = addSeamsCheckbox.checked;

  removeSeams(img, 50, horizontal).then((seams) => {
    if (shouldAddSeams) {
      addSeams(img, seams, horizontal);
    }
  });

  document.getElementById("h").textContent = "" + img.shape[0];
  document.getElementById("w").textContent = "" + img.shape[1];
}

export function loadImage(src) {
  const $image = new Image();
  $image.crossOrigin = "Anonymous";
  $image.onload = () => {
    console.log("loaded");
    populateImage($image);
  }
  $image.src = src;

  return $image;
}
