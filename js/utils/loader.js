/**
 *   This 'loader' will instantiate a multi-file loader. It is used to avoid
 *   duplicate (redundant) file requests and process multiple file requests
 *   asynchronously.
*/
d2b.UTILS.loader = function(){

  var $$ = {};

  // keep track of how many file loads are in progress
  $$.inProgress = 0;

  // all files that have been loaded for this loader, identified by their key
  $$.files = {};

  // callback stack
  $$.stack = [];

  /**
   * Flush the callback stack.
   */
  $$.flushStack = function(){

    if($$.stack.length == 0)
      return;

    var item = $$.stack.shift();

    var my = {};
    item.paths.forEach(function(path){
      my[path.key] = $$.files[path.key];
    });
    if(item.callback)
      item.callback(my);

    $$.flushStack();
  };

  /**
   * The main loader function that will resemble this instance of the multi-file
   * loader.
   * @param paths Array of paths for which to fetch data files.
   *        [
   *          {
   *            key:  'file1',                 // defaults to the file name
   *            file: 'file.csv',              // file name
   *            path: 'http://filestore.com/', // default: 'http://d2b.academicdashboards.com/'
   *            type: 'csv'                    // default: 'json'
   *          }//,{},{}
   *        ]
   * @param callback function
   *        function(files){
   *          // do something with the files when they have loaded..
   *        }
   */
  var loader = function(paths, callback){
    $$.stack.push({callback:callback, paths:paths});

    // loop through file paths
    paths.forEach(function(path){

      // set path config defaults
      path.key = path.key || path.file;
      // path.path = path.path || "http://d2b.academicdashboards.com/";
      path.path = path.path || "http://d2b.s3-website-us-west-2.amazonaws.com/";
      path.type = path.type || "json";

      // check if file with key has already been loaded
      if(!$$.files[path.key]){

        // set this specific file to be in the process of being loaded
        $$.files[path.key] = true;
        // increment the amount of files in progress
        $$.inProgress++;

        // request file with path, file, and type
        d3[path.type](path.path+path.file, function(data){

          // once this file has been loaded decrement the file in progress counter
          $$.inProgress--;
          // save the loaded data
          $$.files[path.key] = data;

          //if no more files are in progress, flush the call stack
          if(!$$.inProgress)
            $$.flushStack();
        });
      }
    });

    //if no files were queued, flush the call stack
    if(!$$.inProgress)
      $$.flushStack();

    return loader;
  };

  return loader;
};

// default loader instance
d2b.UTILS.load = new d2b.UTILS.loader();
