// From https://jsfiddle.net/nicolaspanel/047gwg0q/
import nj from "numjs";

const size = 400;

function addSeam(img) {
    const toRet = [];
    const unrolled = img.tolist();
    const midpoint = img.shape[1] / 2;
    const blackPixel = [0, 0, 0, 255];
    
    for (let r = 0; r < img.shape[0]; r++) {
        toRet.push(unrolled[r]);
        toRet[r].splice(midpoint, 4, blackPixel);
    }
    return nj.array(toRet);
}

function loadImage(src) {
  var $image = new Image();
  $image.crossOrigin = "Anonymous";
  $image.onload = function () {
    var W, H;
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

    const altered = addSeam(img);
    console.log(img.shape);
    console.log(altered.shape);

    const $gray = document.getElementById("grayscale");
    $gray.width = W;
    $gray.height = H;
    nj.images.save(altered, $gray);

    const duration = new Date().valueOf() - start;
    document.getElementById("duration").textContent = "" + duration;
    document.getElementById("h").textContent = "" + img.shape[0];
    document.getElementById("w").textContent = "" + img.shape[1];
  };

  $image.src = src;
}

export default loadImage;
