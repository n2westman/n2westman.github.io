// From https://jsfiddle.net/nicolaspanel/047gwg0q/
import nj from "numjs";

const size = 400;

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
    var img = nj.images.read($image),
      gray = nj.images.rgb2gray(img),
      flipped = img.slice(null, [null, null, -1]),
      scharr = nj.images.scharr(gray), // scharr is a edge detector, like sobel
      resized = nj.images.resize(img, H / 2, W / 2),
      zoomed = img.slice(
        [(img.shape[0] / 4) | 0, ((3 * img.shape[0]) / 4) | 0],
        [(img.shape[1] / 4) | 0, ((3 * img.shape[1]) / 4) | 0]
      ),
      duration = new Date().valueOf() - start;

    // display images in canvas
    var $original = document.getElementById("original");
    $original.width = W;
    $original.height = H;
    nj.images.save(img, $original);

    const altered = nj.zeros([img.shape[0], img.shape[1] + 1, img.shape[2]]);
    
    const first = img.slice([0, img.shape[0]/2]);
    const second = img.slice([img.shape[0]/2, img.shape[0]]);
    // const altered = first; //nj.concatenate(first, second).reshape(img.shape);

    const $gray = document.getElementById("grayscale");
    $gray.width = W;
    $gray.height = H;
    nj.images.save(altered, $gray);

    document.getElementById("duration").textContent = "" + duration;
    document.getElementById("h").textContent = "" + img.shape[0];
    document.getElementById("w").textContent = "" + img.shape[1];
  };

  $image.src = src;
}
export default loadImage;
