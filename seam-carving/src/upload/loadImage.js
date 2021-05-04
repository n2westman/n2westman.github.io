// From https://jsfiddle.net/nicolaspanel/047gwg0q/
import nj from "numjs";

function addSeamVertical(img, seam) {
    const toRet = [];
    const unrolled = img.tolist();
    const blackPixel = [0, 0, 0, 255];
    
    for (let r = 0; r < img.shape[0]; r++) {
        toRet.push(unrolled[r]);
        toRet[r].splice(seam.get(r), 0, blackPixel);
    }
    return nj.array(toRet);
}

function addSeamHorizontal(img, seam) {
    return addSeamVertical(img.transpose(1, 0), seam).transpose(1, 0);
}

function populateImage($image) {
  var W, H;
  const size = Math.max($image.height, $image.width);
  if ($image.width < $image.height) {
    W = ~~((size * $image.width) / $image.height);
    H = ~~size;
  } else {
    H = ~~((size * $image.height) / $image.width);
    W = ~~size;
  }
  var start = new Date().valueOf();
  // process images
  var img = nj.images.read($image);

  // display images in canvas
  var $original = document.getElementById("original");
  $original.width = W;
  $original.height = H;
  nj.images.save(img, $original);

  const diff = nj.cos(nj.arange(H).multiply(3.14/180)).multiply(20);
  const verticalSeam = nj.ones(H).multiply(W/2).add(diff);
  const withHorizontal = addSeamVertical(img, verticalSeam);
  const $horizontalSeam = document.getElementById("horizontalSeam");
  $horizontalSeam.width = W + 1;
  $horizontalSeam.height = H;
  nj.images.save(withHorizontal, $horizontalSeam);

  const diff2 = nj.cos(nj.arange(W).multiply(3.14/180)).multiply(20);
  const horizontalSeam = nj.ones(W).multiply(H/2).add(diff2);
  const withVertical = addSeamHorizontal(img, horizontalSeam);
  const $verticalSeam = document.getElementById("verticalSeam");
  $verticalSeam.width = W;
  $verticalSeam.height = H + 1;
  nj.images.save(withVertical, $verticalSeam);

  const duration = new Date().valueOf() - start;
  document.getElementById("duration").textContent = "" + duration;
  document.getElementById("h").textContent = "" + img.shape[0];
  document.getElementById("w").textContent = "" + img.shape[1];
};

function loadImage(src) {
  var $image = new Image();
  $image.crossOrigin = "Anonymous";
  $image.onload = () => populateImage($image);
  $image.src = src;
}

export default loadImage;
