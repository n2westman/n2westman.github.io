// From https://jsfiddle.net/nicolaspanel/047gwg0q/
import nj from "numjs";
import cwise from "cwise";

function addSeamVertical(img, seam) {
  const toRet = [];
  const unrolled = img.tolist();
  const blackPixel = [0, 0, 0];

  for (let r = 0; r < img.shape[0]; r++) {
    toRet.push(unrolled[r]);
    toRet[r].splice(seam.get(r), 0, blackPixel);
  }
  return nj.array(toRet);
}

function addSeamHorizontal(img, seam) {
  return addSeamVertical(img.transpose(1, 0), seam).transpose(1, 0);
}

function rollVertical(img, amount) {
  const axis = 0;
  const first = img.slice([0, amount]);
  const second = img.slice([amount, img.shape[axis]]);
  return nj.concatenate([second.flatten(), first.flatten()]).reshape(img.shape);
}

function rollHorizontal(img, amount) {
  return rollVertical(img.transpose(1, 0), amount).transpose(1, 0);
}

const doEnergyCalculation = cwise({
  args: [
    "array",
    "array",
    "array",
    "array",
    { offset: [0, 1], array: 1 },
    { offset: [0, 1], array: 2 },
    { offset: [0, 1], array: 3 },
    { offset: [1, 0], array: 1 },
    { offset: [1, 0], array: 2 },
    { offset: [1, 0], array: 3 },
  ],
  body: function rgb2grayCwise(y, xR, xG, xB, xRN, xGN, xBN, xRE, xGE, xBE) {
    y = Math.sqrt(
      (xR - xRN) * (xR - xRN) +
        (xR - xRE) * (xR - xRE) +
        (xG - xGN) * (xG - xGN) +
        (xG - xGE) * (xG - xGN) +
        (xB - xBN) * (xB - xBN) +
        (xB - xBE) * (xB - xBN)
    );
  },
});

function getEnergy(img) {
  var h = img.shape[0];
  var w = img.shape[1];
  var oShape = [h, w];
  var out = new nj.NdArray(new Uint8Array(h * w), oShape);
  var r = img.selection.pick(null, null, 0);
  var g = img.selection.pick(null, null, 1);
  var b = img.selection.pick(null, null, 2);
  doEnergyCalculation(out.selection, r, g, b);
  return out;
}

// TODO(nwestman): Implement improved seam carving https://github.com/axu2/improved-seam-carving

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
  var img = nj.images.read($image).slice(null, null, [3]);

  // display images in canvas
  var $original = document.getElementById("original");
  $original.width = W;
  $original.height = H;
  nj.images.save(img, $original);

  const diff = nj.cos(nj.arange(H).multiply(3.14 / 180)).multiply(20);
  const verticalSeam = nj
    .ones(H)
    .multiply(W / 2)
    .add(diff);
  const withHorizontal = addSeamVertical(img, verticalSeam);
  const $horizontalSeam = document.getElementById("horizontalSeam");
  $horizontalSeam.width = W + 1;
  $horizontalSeam.height = H;
  nj.images.save(withHorizontal, $horizontalSeam);

  const diff2 = nj.cos(nj.arange(W).multiply(3.14 / 180)).multiply(20);
  const horizontalSeam = nj
    .ones(W)
    .multiply(H / 2)
    .add(diff2);
  const withVertical = addSeamHorizontal(img, horizontalSeam);
  const $verticalSeam = document.getElementById("verticalSeam");
  $verticalSeam.width = W;
  $verticalSeam.height = H + 1;
  nj.images.save(withVertical, $verticalSeam);

  const energyMap = getEnergy(img);
  const $energy = document.getElementById("energy");
  $energy.width = W;
  $energy.height = H + 1;
  nj.images.save(energyMap, $energy);

  const duration = new Date().valueOf() - start;
  document.getElementById("duration").textContent = "" + duration;
  document.getElementById("h").textContent = "" + img.shape[0];
  document.getElementById("w").textContent = "" + img.shape[1];
}

function loadImage(src) {
  var $image = new Image();
  $image.crossOrigin = "Anonymous";
  $image.onload = () => populateImage($image);
  $image.src = src;
}

export default loadImage;
