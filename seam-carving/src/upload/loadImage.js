// From https://jsfiddle.net/nicolaspanel/047gwg0q/
import nj from "numjs";

function addSeamVertical(img) {
    const toRet = [];
    const unrolled = img.tolist();
    const midpoint = img.shape[1] / 2;
    const blackPixel = [0, 0, 0, 255];
    
    for (let r = 0; r < img.shape[0]; r++) {
        toRet.push(unrolled[r]);
        toRet[r].splice(midpoint, 0, blackPixel);
    }
    return nj.array(toRet);
}

function addSeamHorizontal(img) {
    return addSeamVertical(img.transpose(1, 0)).transpose(1, 0);
}

function loadImage(src) {
  var $image = new Image();
  $image.crossOrigin = "Anonymous";
  $image.onload = function () {
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

    const withHorizontal = addSeamVertical(img);
    const $horizontalSeam = document.getElementById("horizontalSeam");
    $horizontalSeam.width = W + 1;
    $horizontalSeam.height = H;
    nj.images.save(withHorizontal, $horizontalSeam);

    const withVertical = addSeamHorizontal(img);
    const $verticalSeam = document.getElementById("verticalSeam");
    $verticalSeam.width = W;
    $verticalSeam.height = H + 1;
    nj.images.save(withVertical, $verticalSeam);

    const duration = new Date().valueOf() - start;
    document.getElementById("duration").textContent = "" + duration;
    document.getElementById("h").textContent = "" + img.shape[0];
    document.getElementById("w").textContent = "" + img.shape[1];
  };

  $image.src = src;
}

export default loadImage;
