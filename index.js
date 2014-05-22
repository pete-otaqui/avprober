var spawn = require('child_process').spawn,
    fs = require('fs'),
    path = require('path'),
    Promise = require('es6-promise').Promise;

module.exports = (function() {
  
  function findBlocks(raw) {
    var blocks = {streams: null, format: null, format_tags: null};
    blocks.format = getBlock(raw, 'format', false);
    blocks.format_tags = getBlock(raw, 'format.tags');
    var index = 0,
        streams = [],
        stream = getBlock(raw, 'streams.stream.' + index);
    while ( stream ) {
        streams.push(stream);
        index++;
        stream = getBlock(raw, 'streams.stream.' + index)
    }
    blocks.streams = streams;
    return blocks;
  }

  function getBlock(raw, name, get_tags) {
    var block_name = '[' + name + ']',
        block_start = raw.indexOf(block_name),
        block_end = raw.indexOf('\n\n', block_start);
    if ( block_start === -1 ) {
      return false;
    }
    var str = raw.slice(block_start + block_name.length, block_end);
    if ( get_tags !== false && name.indexOf('tags') === -1 ) {
      str += getBlock(raw, name + '.tags');
    }
    return str;
  }

  function parseBlock(block) {
    var block_object = {}, lines = block.split('\n');
    lines.forEach(function(line) {
      var data = line.split('=');
      if ( data && data.length === 2 ) {
        block_object[data[0]] = parseField(data[1]);
      }
    });
    return block_object;
  }

  function parseField(str) {
    str = ("" + str).trim();
    return str.match(/^\d+\.?\d*$/) ? parseFloat(str) : str;
  }

  function parseStreams(list) {
    return list.map(parseBlock);
  }

  function parseFormat(blocks) {
    if ( !text ) return {format: null};

    return {
      format : parseBlock(blocks.format),
      metadata : parseBlock(blocks.format_tags)
    };
  }


  function doAvprobe(file) {
    var promise = new Promise(function(resolve, reject) {
      var proc = spawn('avprobe', ['-show_streams', '-show_format', '-loglevel', 'warning', file]),
          probeData = [],
          errData = [],
          exitCode = null;

      proc.stdout.setEncoding('utf8');
      proc.stderr.setEncoding('utf8');

      proc.stdout.on('data', function(data) { probeData.push(data); });
      proc.stderr.on('data', function(data) { errData.push(data); });
      
      proc.on('exit', function(code) {
        exitCode = code;
      });

      proc.on('error', function(err) {
        reject(err);
      });

      proc.on('close', function() {
        var blocks = findBlocks(probeData.join(''));
        console.log('blocks');
        console.log(blocks.format);

        if ( exitCode ) {
          var err_output = errData.join('');
          return reject(err_output);
        }

        resolve({
          format: parseBlock(blocks.format),
          metadata: parseBlock(blocks.format_tags),
          streams: parseStreams(blocks.streams)
        });
      });

    });
    return promise;
  }

  return doAvprobe;

})();