define (function () {
  AudioSourceLoader = {
    /**
     * Load an audio file from an object of type File. Needs an audio context to
     * decode data. onsuccess callback contains the audioBuffer
     */
    loadFromFile : function(file, context, onsuccess, options) {
      var reader = new FileReader;
      
      if (!file.type.match('audio.mp3') && !file.type.match('audio.wav')) {
        throw('Unsupported file format!');
      }
      
      reader.onloadend = function(e) {
        if (e.target.readyState == FileReader.DONE) { // DONE == 2
          context.decodeAudioData(e.target.result, onsuccess, onerror);
        }
      };
      reader.onerror = options.onerror || function () {
        alert('AudioSourceLoader: error');        
      }
      reader.onprogress = options.onprogress;

      reader.readAsArrayBuffer(file);  
    },

    /**
     * Load an audio file from a url. Needs an audio context to
     * decode data. onsuccess callback contains the audioBuffer
     */
    loadFromUrl : function(url, context, onsuccess, options) {
      // Load buffer asynchronously
      var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";
      var loader = this;
      request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        context.decodeAudioData(request.response, onsuccess, onerror);
      }
      request.onprogress = options.onprogress || function (e) {
        var complete = e.position * 100 / e.totalSize;
      }
      request.onloadstart = options.onloadstart || function (e) {
      }
      request.onerror = options.onerror || function() {
        alert('BufferLoader: XHR error');
      }
      request.send();
    }
    
  };

  return AudioSourceLoader;
});