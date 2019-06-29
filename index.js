const isNode8 = process.versions.node.startsWith('8.');
module.exports = require(`./build${isNode8 ? '8' : ''}`);
