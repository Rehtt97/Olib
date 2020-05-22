const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const extractCover = require('epub-cover-extractor');
const { promisify } = require('util');

const _extractCover = (epubPath, destPath) => {
  return new Promise((resolve) => {
    extractCover.fromFilePath(epubPath, destPath, (err, imgPath) => {
      if (err) {
        resolve('NOTFOUND');
      } else {
        resolve(imgPath);
      }
    });
  });
};

exports.removeDirectory = (_path) => {
  return new Promise((resolve) => {
    rimraf(_path, () => {
      resolve('success');
    });
  });
};

exports.isFileExists = (_path) => {
  return new Promise((resolve) => {
    fs.access(_path, (err) => {
      if (err) resolve(false);
      resolve(true);
    });
  });
};

exports.deleteBook = (_path) => {
  return new Promise((resolve) => {
    fs.unlink(_path, () => {
      resolve('delete successfully.');
    });
  });
};

// destPath ./public/cover
exports.accurateCoverPath = async (epubPath, destPath) => {
  const coverPath = await _extractCover(epubPath, destPath);
  if (coverPath === 'NOTFOUND') return 'default.jpg';
  const ext = path.extname(coverPath);
  const now = Date.now();
  await promisify(fs.rename)(coverPath, `${destPath}${now}${ext}`);

  return `${now}${ext}`;
};
