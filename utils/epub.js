const Epub = require('epub');

exports.getMetaData = filepath => {
  const book = new Epub(filepath);
  return new Promise(resolve => {
    book.on('end', () => {
      const metadata = {
        title: book.metadata.title,
        author: book.metadata.creatorFileAs,
        summary: book.metadata.description,
        press: book.metadata.publisher,
        language: book.metadata.language,
        cover: book.metadata.cover,
        publishDate: book.metadata.date,
        categories: book.metadata.subject
      };
      resolve(metadata);
    });
    book.parse();
  });
};
