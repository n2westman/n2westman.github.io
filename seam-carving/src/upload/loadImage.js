// From https://jsfiddle.net/nicolaspanel/047gwg0q/
import nj from "numjs";
import { removeSeams, addSeams } from "./seams";

export function populateImage($image, iter, $mask) {
  const img = nj.images.read($image).slice(null, null, [3]);
  let mask = null;

  // display images in canvas
  const $original = document.getElementById("original");
  $original.width = img.shape[1];
  $original.height = img.shape[0];
  nj.images.save(img, $original);

  // Should check that shapes match, eventually.
  if ($mask) {
    mask = nj.images.rgb2gray(nj.images.read($mask));

    const $maskCanvas = document.getElementById("mask");
    $maskCanvas.width = img.shape[1];
    $maskCanvas.height = img.shape[0];
    nj.images.save(mask, $maskCanvas);
  }

  const horizontalCheckbox = document.querySelector(
    "input[type=checkbox][name=horizontal]"
  );
  const horizontal = horizontalCheckbox.checked;

  const addSeamsCheckbox = document.querySelector(
    "input[type=checkbox][name=addSeams]"
  );
  const shouldAddSeams = addSeamsCheckbox.checked;

  removeSeams(img, iter, mask, horizontal).then((seams) => {
    if (shouldAddSeams) {
      addSeams(img, seams, horizontal);
    }
  });

  document.getElementById("h").textContent = "" + img.shape[0];
  document.getElementById("w").textContent = "" + img.shape[1];
}
