// From https://jsfiddle.net/nicolaspanel/047gwg0q/
import nj from "numjs";
import cwise from "cwise";
import { argmin } from "ndarray-ops";

function addSeamVertical(img, seam) {
  const toRet = [];
  const unrolled = img.tolist();

  for (let r = 0; r < img.shape[0]; r++) {
    toRet.push(unrolled[r]);
    const c = seam.get(r);
    const pixel = [
      (img.get(r, c-1, 0) + img.get(r, c, 0) + img.get(r, c+1, 0)) / 3,
      (img.get(r, c-1, 1) + img.get(r, c, 1) + img.get(r, c+1, 1)) / 3,
      (img.get(r, c-1, 2) + img.get(r, c, 2) + img.get(r, c+1, 2)) / 3
    ];
    toRet[r].splice(c, 0, pixel);
  }
  return nj.array(toRet);
}

function addSeamToMap(img, seam) {
  for (let r = 0; r < img.shape[0]; r++) {
    img.set(r, seam.get(r), 255);
  }
  return img;
}

function removeSeamVertical(img, seam) {
  const toRet = [];
  const unrolled = img.tolist();

  for (let r = 0; r < img.shape[0]; r++) {
    toRet.push(unrolled[r]);
    toRet[r].splice(seam.get(r), 1);
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

// sqrt(sum(xgrad .^ 2, ygrad .^ 2))
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
  body: function energyCalculationCwise(
    y,
    xR,
    xG,
    xB,
    xRN,
    xGN,
    xBN,
    xRE,
    xGE,
    xBE
  ) {
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

const doBacktrackCalculation = cwise({
  args: [
    "array",
    "array",
    { offset: [-1, -1], array: 1 },
    { offset: [0, -1], array: 1 },
    { offset: [1, -1], array: 1 },
    "index",
  ],
  body: function backtrackCwise(backtrack, energy, jNW, jN, jNE, index) {
    const min = Math.min(jNW, jN, jNE);
    energy += min;
    const offset = jNW === min ? -1 : jN === min ? 0 : 1;
    const idx = index[1] + offset;
    backtrack = idx < 0 ? 0 : idx;
  },
});

function getEnergy(img) {
  var h = img.shape[0];
  var w = img.shape[1];
  var oShape = [h, w];
  var out = new nj.NdArray(new Uint16Array(h * w), oShape);
  var r = img.selection.pick(null, null, 0);
  var g = img.selection.pick(null, null, 1);
  var b = img.selection.pick(null, null, 2);
  doEnergyCalculation(out.selection, r, g, b);
  return out;
}

// function getForwardEnergy(img) {
//   const grayImage = nj.images.rgb2gray(img);
//   const h = grayImage.shape[0];
//   const w = grayImage.shape[1];

//   const U = rollVertical(grayImage, 1)
//   const L = rollHorizontal(grayImage, 1).add(U);
//   const R = rollHorizontal(grayImage, -1).add(U);

//   for i in range(1, h):
//         mU = m[i-1]
//         mL = np.roll(mU, 1)
//         mR = np.roll(mU, -1)

//         mULR = np.array([mU, mL, mR])
//         cULR = np.array([cU[i], cL[i], cR[i]])
//         mULR += cULR

//         argmins = np.argmin(mULR, axis=0)
//         m[i] = np.choose(argmins, mULR)
//         energy[i] = np.choose(argmins, cULR)
// }

function getMinimumSeam(energy) {
  const backtrack = nj.zeros(energy.shape);
  const h = energy.shape[0];
  const w = energy.shape[1];

  // idx = np.argmin(M[i - 1, j-1:j + 2])
  // backtrack[i, j] = idx + j
  // min_energy = M[i-1, idx + j]

  for (let i = 1; i < h; i++) {
    for (let j = 0; j < w; j++) {
      let e = energy.get(i - 1, j);
      let o = 0;
      if (j > 0 && e > energy.get(i - 1, j - 1)) {
        e = energy.get(i - 1, j - 1);
        o = -1;
      }
      if (j < w - 1 && e > energy.get(i - 1, j + 1)) {
        e = energy.get(i - 1, j + 1);
        o = 1;
      }
      backtrack.set(i, j, j + o);
      energy.set(i, j, energy.get(i, j) + e);
    }
  }

  const seam = [];
  let j = argmin(energy.slice(-1).flatten().selection);

  for (let i = h - 1; i > -1; i--) {
    seam.unshift(j);
    j = backtrack.get(i, j);
  }

  return nj.array(seam);
}

// TODO(nwestman): Implement improved seam carving https://github.com/axu2/improved-seam-carving

/**
 * @param {NdArray} img - Image from which to remove seams
 * @param {number} iter - Number of pixels to remove
 * @returns Promise<NdArray[]>
 */
function removeSeams(img, iter) {
  return new Promise((resolve, reject) => {
    const seams = [];
    let processing = img.clone();
    let timesRun = 0;
    let interval = setInterval(function () {
      timesRun += 1;
      if (timesRun > iter) {
        clearInterval(interval);
        resolve(seams);
        return;
      }

      const energyMap = getEnergy(processing);
      const seam = getMinimumSeam(energyMap.clone());
      seams.unshift(seam);

      const energyWithSeam = addSeamToMap(energyMap, seam);
      const $energy = document.getElementById("energy");
      $energy.width = energyWithSeam.shape[1];
      $energy.height = energyWithSeam.shape[0];
      nj.images.save(energyWithSeam, $energy);

      const withoutSeam = removeSeamVertical(processing, seam);
      // const $seam = document.getElementById("seam");
      // $seam.width = withoutSeam.shape[1];
      // $seam.height = withoutSeam.shape[0];
      // nj.images.save(withoutSeam, $seam);

      processing = withoutSeam;
    }, 100);

  });

}

function addSeams(img, seams) {
  const iter = seams.length;
  return new Promise((resolve, reject) => {
    let processing = img;
    let timesRun = 0;
    let interval = setInterval(function () {
      timesRun += 1;
      if (timesRun > iter) {
        clearInterval(interval);
        resolve();
        return;
      }

      const seam = seams.pop();
      const withoutSeam = addSeamVertical(processing, seam);

      for (const remainingSeam of seams) {
        const diff = nj.clip(remainingSeam.subtract(seam), -1, 0).add(1).multiply(2);
        remainingSeam.add(diff, false);
      }

      const $seam = document.getElementById("seam");
      $seam.width = withoutSeam.shape[1];
      $seam.height = withoutSeam.shape[0];
      nj.images.save(withoutSeam, $seam);

      processing = withoutSeam;
    }, 100);
  });
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
  var img = nj.images.read($image).slice(null, null, [3]);

  // display images in canvas
  var $original = document.getElementById("original");
  $original.width = img.shape[1];
  $original.height = img.shape[0];
  nj.images.save(img, $original);

  // const diff = nj.cos(nj.arange(H).multiply(3.14 / 180)).multiply(20);
  // const verticalSeam = nj
  //   .ones(H)
  //   .multiply(W / 2)
  //   .add(diff);
  // const withHorizontal = addSeamVertical(img, verticalSeam);
  // const $horizontalSeam = document.getElementById("horizontalSeam");
  // $horizontalSeam.width = W + 1;
  // $horizontalSeam.height = H;
  // nj.images.save(withHorizontal, $horizontalSeam);

  // const diff2 = nj.cos(nj.arange(W).multiply(3.14 / 180)).multiply(20);
  // const horizontalSeam = nj
  //   .ones(W)
  //   .multiply(H / 2)
  //   .add(diff2);
  // const withVertical = addSeamHorizontal(img, horizontalSeam);
  // const $verticalSeam = document.getElementById("verticalSeam");
  // $verticalSeam.width = W;
  // $verticalSeam.height = H + 1;
  // nj.images.save(withVertical, $verticalSeam);

  removeSeams(img, 50).then((seams) => addSeams(img, seams));

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
