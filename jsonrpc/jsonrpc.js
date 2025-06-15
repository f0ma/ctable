var _jrpc= {};
_jrpc.call_uid = 1000;
_jrpc.call_queue = {};
_jrpc.slots = {};
_jrpc.url = _rpcurl;

_jrpc.connect = function (method, handler) {
    _jrpc.slots[method] = handler;
}

_jrpc.call = function (method, params) {
    _jrpc.call_uid += 1;
    var this_call_uid = "cl"+_jrpc.call_uid;
    _jrpc.call_queue[this_call_uid] = [{"jsonrpc":"2.0", "method":method, "params":params, "id":this_call_uid}, null, null];

    var callPromise = new Promise((resolve, reject) => {
        setTimeout(function() {
            var calls_without_fetch = Object.values(_jrpc.call_queue).filter(x => x[1] === null).map(x => x[0]["id"]);

            if(calls_without_fetch.length > 0){
                var fp = fetch(_jrpc.url,
                      { method: "POST",
                        headers: { "Content-type": "application/json"},
                        body:  JSON.stringify(calls_without_fetch.map(x => _jrpc.call_queue[x][0])) })
                .then(response => response.json())
                .then(function(response){
                    if (!Array.isArray(response)){
                        response = [response];
                    }
                    response.forEach(function (x) {
                        if(typeof x.id === 'undefined'){
                            if(typeof _jrpc.slots[x.method] !== 'undefined')
                                setTimeout(function() {
                                    if(typeof x.params !== 'undefined'){
                                        _jrpc.slots[x.method].forEach(y=>y(...x.params));
                                    } else {
                                        _jrpc.slots[x.method].forEach(y=>y());
                                    }
                                }, 0);
                        }
                        else if(x.id === null && x.error){
                            calls_without_fetch.forEach(w => _jrpc.call_queue[w][2] = x);
                        }
                        else {
                            _jrpc.call_queue[x.id][2] = x;
                        }
                    });

                });
                calls_without_fetch.forEach(x => _jrpc.call_queue[x][1] = fp);
            }

            _jrpc.call_queue[this_call_uid][1].then(x => {
                let result = _jrpc.call_queue[this_call_uid][2];
                if(result.error){
                    reject(result.error);
                } else {
                    resolve(result.result);
                }
                delete _jrpc.call_queue[this_call_uid];
            });

    },0);

  });

  return callPromise;

};


