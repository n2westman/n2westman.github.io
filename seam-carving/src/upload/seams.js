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

function addSeamHorizontal(img, seam) {
  return addSeamVertical(img.transpose(1, 0), seam).transpose(1, 0);
}

export function addSeam(img, seam, horizontal) {
  if (horizontal) {
    return addSeamHorizontal(img, seam);
  }
  return addSeamVertical(img, seam);
}

function addSeamToMapVertical(img, seam) {
  for (let r = 0; r < img.shape[0]; r++) {
    img.set(r, seam.get(r), 255);
  }
  return img;
}

function addSeamToMapHorizontal(img, seam) {
  return addSeamToMapVertical(img.transpose(1, 0), seam).transpose(1, 0);
}

export function addSeamToMap(img, seam, horizontal) {
  if (horizontal) {
    return addSeamToMapHorizontal(img, seam);
  }
  return addSeamToMapVertical(img, seam);
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

function removeSeamHorizontal(img, seam) {
  return removeSeamVertical(img.transpose(1, 0), seam).transpose(1, 0);
}

export function removeSeam(img, seam, horizontal) {
  if (horizontal) {
    return removeSeamHorizontal(img, seam);
  }
  return removeSeamVertical(img, seam);
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

export function getEnergy(img, mask) {
  var h = img.shape[0];
  var w = img.shape[1];
  var oShape = [h, w];
  var out = new nj.NdArray(new Uint16Array(h * w), oShape);
  var r = img.selection.pick(null, null, 0);
  var g = img.selection.pick(null, null, 1);
  var b = img.selection.pick(null, null, 2);
  doEnergyCalculation(out.selection, r, g, b);

  if (mask) {
      out = out.add(mask);
  }

  return out;
}

function getMinimumSeamVertical(energy) {
  const backtrack = nj.zeros(energy.shape);
  const h = energy.shape[0];
  const w = energy.shape[1];

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

function getMinimumSeamHorizontal(energy) {
  return getMinimumSeamVertical(energy.transpose(1, 0));
}

export function getMinimumSeam(energy, horizontal) {
  if (horizontal) {
    return getMinimumSeamHorizontal(energy);
  }
  return getMinimumSeamVertical(energy);
}

// TODO(nwestman): Implement improved seam carving https://github.com/axu2/improved-seam-carving

/**
 * @param {NdArray} img - Image from which to remove seams
 * @param {number} iter - Number of pixels to remove
 * @returns Promise<NdArray[]>
 */
export function removeSeams(img, iter, mask = null, horizontal = false) {
  return new Promise((resolve, reject) => {
    const seams = [];
    let processing = img.clone();
    let processingMask = mask && mask.clone();
    let timesRun = 0;
    let interval = setInterval(function () {
      timesRun += 1;
      if (timesRun > iter) {
        clearInterval(interval);
        resolve(seams);
        return;
      }

      const energyMap = getEnergy(processing, processingMask);
      const seam = getMinimumSeam(energyMap.clone(), horizontal);
      seams.unshift(seam);

      const energyWithSeam = addSeamToMap(energyMap, seam, horizontal);
      const $energy = document.getElementById("energy");
      $energy.width = energyWithSeam.shape[1];
      $energy.height = energyWithSeam.shape[0];
      nj.images.save(energyWithSeam, $energy);

      const withoutSeam = removeSeam(processing, seam, horizontal);
      
      if (processingMask) {
          processingMask = removeSeam(processingMask, seam, horizontal);
      }

      const $seam = document.getElementById("seam");
      $seam.width = withoutSeam.shape[1];
      $seam.height = withoutSeam.shape[0];
      nj.images.save(withoutSeam, $seam);

      processing = withoutSeam;
    }, 100);
  });
}

export function addSeams(img, seams, horizontal) {
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
      const withoutSeam = addSeam(processing, seam, horizontal);

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
