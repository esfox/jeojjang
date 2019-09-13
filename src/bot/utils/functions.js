exports.sleep = async seconds =>
  new Promise(resolve => setTimeout(_ => resolve(), seconds * 1000));

exports.parseTags = tags => tags.join(' ').split(',').filter(tag => tag);
