<?php

class JsonRPCException extends Exception {
    public function JsonRPCErrorCode() {
        return -32099;
    }
}

class JsonRPCParseError extends JsonRPCException {
    public function JsonRPCErrorCode() {
        return -32700;
    }
}

class JsonRPCInvalidRequest extends JsonRPCException {
    public function JsonRPCErrorCode() {
        return -32600;
    }
}

class JsonRPCMethodNotFound extends JsonRPCException {
    public function JsonRPCErrorCode() {
        return -32601;
    }
}

class JsonRPCInvalidParams extends JsonRPCException {
    public function JsonRPCErrorCode() {
        return -32602;
    }
}

class JsonRPCInternalError extends JsonRPCException {
    public function JsonRPCErrorCode() {
        return -32603;
    }
}

class JsonRPCHandler{

}

$GLOBALS['JsonRPCSignals'] = [];
$GLOBALS['JsonRPCSignalList'] = [];

class JsonRPCSignal {
    protected string $name;
    function __construct($name) {
        $this->name = $name;
        if(!in_array($name, $GLOBALS['JsonRPCSignals']))
            $GLOBALS['JsonRPCSignals'][]=$name;
    }
    public function emit() {
        $GLOBALS['JsonRPCSignalList'][]=[$this->name, func_get_args()];
    }
}

function JsonRPCAPIDiscover(){
    $api = [];

    foreach (glob("*.handler.php") as $filename) {
        list($class_name, $tail) = explode('.', $filename, 2);
        if($class_name == "Default"){
            $class_name = "DefaultJsonRPCHandler";
            $api_class = "";
        } else {
            $api_class = $class_name;
        }

        require $filename;

        $api[$api_class] = [];

        $refc = new ReflectionClass($class_name);

        foreach($refc->getMethods() as $refm){
            if (str_starts_with($refm->name, "_")) continue;
            $api[$api_class][$refm->name] = [];
            foreach($refm->getParameters() as $p){
                $api[$api_class][$refm->name][] = $p->name;
            }
        }

    }

    return $api;
}

function has_string_keys(array $array) {
    return count(array_filter(array_keys($array), 'is_string')) > 0;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET["upload"])){

    $upload_results = [];
    $cnt = 7493850;
    foreach($_FILES as $f){
        $storage_name = NULL;
        $pre = NULL;
        $file = NULL;

        if(!is_file($f['tmp_name'])){
            throw new JsonRPCInvalidRequest("Can't upload file");
        }

        while (1){
            $storage_name = md5(md5_file($f['tmp_name']).$f['name'].$f['tmp_name'].$cnt);
            $pre = substr($storage_name, 0, 2);
            $file = "uploads/".$pre."/".$storage_name;
            if(!file_exists($file)) break;
            $cnt += 42;
        }
        if(!is_dir("uploads/".$pre))
            mkdir("uploads/".$pre);
        move_uploaded_file($f['tmp_name'],$file);
        $fname = preg_replace('/[^a-zA-Z0-9 \-\._\pL)(]/u', '_', $f['name']);
        $upload_results[]=$storage_name.":".$f['size'].":".$fname;
    }
    echo json_encode($upload_results);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER["CONTENT_TYPE"] == "application/json") {
    try {
        $request = json_decode(file_get_contents('php://input'), true);

        if(!is_array($request)){
            throw new JsonRPCParseError("Invalid request structure");
        }

        if(count($request) == 0){
            throw new JsonRPCInvalidRequest("Empty request");
        }

        $callList = [];

        if (has_string_keys($request)){
            $callList = [$request];
        } else {
            $callList = $request;
        }

        $respList = [];
        $respMethods = [];

        foreach($callList as $data){

            ob_start();

            try {

                if (!isset($data["jsonrpc"]) || $data["jsonrpc"] != "2.0"){
                    throw new JsonRPCInvalidRequest("Invalid jsonrpc field");
                }
                if (!isset($data["method"]) || !is_string($data["method"]) ){
                    throw new JsonRPCInvalidRequest("Invalid method field");
                }
                if(isset($data["id"]) && !is_string($data["id"]) && !is_int($data["id"]) && !is_null($data["id"])){
                    throw new JsonRPCInvalidRequest("Invalid id field");
                }
                if(isset($data["params"]) && !is_array($data["params"])){
                    throw new JsonRPCInvalidRequest("Invalid param field");
                }
                if(count(array_diff(array_keys($data),["jsonrpc","method","params","id"])) > 0){
                    throw new JsonRPCInvalidRequest("Unexpected fields");
                }


                if(!str_contains($data["method"], '.')){
                    if(!class_exists("DefaultJsonRPCHandler")){
                        require "Default.handler.php";
                    }
                    $class_name = 'DefaultJsonRPCHandler';
                    $method_name = $data["method"];
                } else {
                    list($class_name, $method_name) = explode('.', $data["method"], 2);
                    if(!class_exists($class_name)){
                        require $class_name.".handler.php";
                    }
                    if(!class_exists($class_name)){
                        throw new JsonRPCMethodNotFound("Class not found");
                    }
                }

                $handler = new $class_name();

                if (!method_exists($handler, $method_name)){
                    throw new JsonRPCMethodNotFound("Method not found");
                }

                $refm = new ReflectionMethod($class_name, $method_name);

                if (has_string_keys($data['params'])){
                    foreach($refm->getParameters() as $p){
                        $paramNames = [];
                        if (!$p->isOptional()){
                            $paramNames[]=$p->name;
                            if(!isset($data['params'][$p->name])){
                                throw new JsonRPCInvalidParams("Argument {$p->name} is requried");
                            }
                        }
                    }
                    if(count(array_diff($data['params'],$paramNames)) > 0){
                        throw new JsonRPCInvalidParams("Unexpected named argument");
                    }
                } else {
                    if(count($refm->getParameters()) != count($data['params'])){
                        throw new JsonRPCInvalidParams("Invalid positional parameters count");
                    }

                }

                $GLOBALS['JsonRPCSignalList'] = [];
                $respMethods[]=$method_name;
                $result = $handler->{$method_name}(...$data['params']);
                //usleep(300000);

                foreach($JsonRPCSignalList as $sig){
                    $respList[]=["jsonrpc" => "2.0", "method" => $sig[0], "params" => $sig[1]];
                }

                $GLOBALS['JsonRPCSignalList'] = [];

                if (isset($data["id"])){
                    $respList[]=["jsonrpc" => "2.0", "result" => $result, "id" => $data["id"]];
                }

            } catch (JsonRPCException $exception) {
                if (isset($data["id"])){
                    $respList[]=["jsonrpc" => "2.0", "error" => ["code" => $exception->JsonRPCErrorCode(), "message" => $exception->getMessage(), "file" =>  basename($exception->getFile()), "line" =>$exception->getLine()], "id" => $data["id"]];
                } else {
                    $respList[]=["jsonrpc" => "2.0", "error" => ["code" => $exception->JsonRPCErrorCode(), "message" => $exception->getMessage(), "file" =>  basename($exception->getFile()), "line" =>$exception->getLine()], "id" => NULL];
                }
            } catch (Throwable $exception) {
                if (isset($data["id"])){
                    $respList[]=["jsonrpc" => "2.0", "error" => ["code" => -32603, "message" => $exception->getMessage(), "file" =>  basename($exception->getFile()), "line" =>$exception->getLine()], "id" => $data["id"]];
                }
            } finally {
                ob_end_clean();
            }

        }

    //error_log(var_export($respList, true));

    if(($respMethods[0] != "download" && $respMethods[0] != "action_download") || isset($respList[0]['error']) ){
        header('Content-Type: application/json; charset=utf-8');
        if (count($respList) == 1){
            echo json_encode($respList[0]);
        } else {
            echo json_encode($respList);
        }
    } else {
        $name = $respList[0]['result']['name'];
        $pre = substr($respList[0]['result']['file'], 0, 2);
        $file = "";

        if(substr($respList[0]['result']['file'], 0, 1) == "/"){
            $file = $respList[0]['result']['file'];
        } else {
            $file = "uploads/".$pre."/".$respList[0]['result']['file'];
        }

        header("Content-type: application/octet-stream");
        header("Content-disposition: attachment; filename=".rawurlencode($name));
        readfile($file);

        if($respList[0]['result']['cleanup']){
            foreach($respList[0]['result']['cleanup'] as $fd){
                if(is_file($fd)) unlink($fd);
                if(is_dir($fd)) rmdir($fd);
            }
        }

    }



    } catch (\JsonException $exception) {
        echo json_encode(["jsonrpc" => "2.0", "error" => ["code" => -32700, "message" => $exception->getMessage(), "file" =>  basename($exception->getFile()), "line" =>$exception->getLine()], "id" => null]);
    } catch (JsonRPCException $exception) {
        echo json_encode(["jsonrpc" => "2.0", "error" => ["code" => $exception->JsonRPCErrorCode(), "message" => $exception->getMessage(), "file" =>  basename($exception->getFile()), "line" =>$exception->getLine()], "id" => null]);
    } catch (Throwable $e) {
        echo json_encode(["jsonrpc" => "2.0", "error" => ["code" => -32099, "message" => $exception->getMessage(), "file" =>  basename($exception->getFile()), "line" =>$exception->getLine()], "id" => null]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET["format"] == "js") {

    $var_url = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

    $api = JsonRPCAPIDiscover();

    $js = <<<EOF
export var jrpc= {};

jrpc.call_uid = 1000;
jrpc.call_lbl = (Math.random() + 1).toString(36).substring(3);
jrpc.call_queue = {};
jrpc.slots = {};
jrpc.url = _rpcurl;

jrpc.upload = function (files) {

const formData = new FormData();
for (const file of files) {
    formData.append('files', file);
}

var putPromise = new Promise((resolve, reject) => {
    fetch(jrpc.url+"?upload=true", {method:'POST', body:formData}).then(response => resolve(response.json())).catch(response => reject(response.json()));
});

return putPromise;
}

jrpc.connect = function (method, handler) {
jrpc.slots[method] = handler;
}

jrpc.call = function (method, params) {
jrpc.call_uid += 1;
var this_call_uid = jrpc.call_lbl+jrpc.call_uid;
jrpc.call_queue[this_call_uid] = [{"jsonrpc":"2.0", "method":method, "params":params, "id":this_call_uid}, null, null];

var callPromise = new Promise((resolve, reject) => {
setTimeout(function() {
var calls_without_fetch = Object.values(jrpc.call_queue).filter(x => x[1] === null).map(x => x[0]["id"]);

if(calls_without_fetch.length > 0){
    var fp = fetch(jrpc.url,
    { method: "POST",
    signal: AbortSignal.timeout(5000),
    headers: { "Content-type": "application/json"},
    body:  JSON.stringify(calls_without_fetch.map(x => jrpc.call_queue[x][0])) })
    .catch(err => {return calls_without_fetch.map(x => { return {jsonrpc:"2.0", id:x, error:{code:-1, message:"Network error: "+err.message, file:"", line:""}}}); })
    .then(response => {
        if(response.ok !== true) return response;
            return response.json()})
    .then(function(response){
    if(response === undefined) return;
    if (!Array.isArray(response)){
        response = [response];
    }
    response.forEach(function (x) {
    if(typeof x.id === 'undefined'){
        if(typeof jrpc.slots[x.method] !== 'undefined')
            setTimeout(function() {
            if(typeof x.params !== 'undefined'){
                jrpc.slots[x.method].forEach(y=>y(...x.params));
    } else {
        jrpc.slots[x.method].forEach(y=>y());
    }
    }, 0);
    }
    else if(x.id === null && x.error){
        calls_without_fetch.forEach(w => jrpc.call_queue[w][2] = x);
    }
    else {
        jrpc.call_queue[x.id][2] = x;
    }
    });

});
calls_without_fetch.forEach(x => jrpc.call_queue[x][1] = fp);
}

jrpc.call_queue[this_call_uid][1].then(x => {
let result = jrpc.call_queue[this_call_uid][2];
if(result.error){
    reject(result.error);
} else {
    resolve(result.result);
}
delete jrpc.call_queue[this_call_uid];
});

},0);

});

return callPromise;

};

jrpc.call_download = function (method, params) {
    jrpc.call_uid += 1;
    var this_call_uid = jrpc.call_lbl+jrpc.call_uid;

    var fp = fetch(jrpc.url,
    { method: "POST",
    headers: { "Content-type": "application/json"},
    body:  JSON.stringify({"jsonrpc":"2.0", "method":method, "params":params, "id":this_call_uid})})
    .then(response => {return {blob: response.blob(), filename: response.headers.get('content-disposition').split('filename=')[1] }; })
    .then(function(response){
        response.blob.then(blob => {
        const href = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement("a"), {
        href,
        style: "display:none",
        download: decodeURI(response.filename),
        });
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(href);
        a.remove();
    });
    });
    return fp;
}

EOF;

    $var_name = "jrpc";

    $js = str_replace("_rpcurl",'"'.$var_url.'"', $js);

    $jsapi = "";

    foreach($api as $c => $m){
        if ($c == ""){
            foreach($api[$c] as $m => $p){
                $jsapi .= $var_name.".".$m." = function (".implode(",",$p).") {return ".$var_name.".call(\"".$m."\",[".implode(",",$p)."]);};\n";
            }
        } else {
            $jsapi .= "jrpc.".$c." = {};\n";
            foreach($api[$c] as $m => $p){
                if($m != "download" && $m != "action_download") {
                    $jsapi .= $var_name.".".$c.".".$m." = function (".implode(",",$p).") {return ".$var_name.".call(\"".$c.".".$m."\",[".implode(",",$p)."]);};\n";
                } else {
                    $jsapi .= $var_name.".".$c.".".$m." = function (".implode(",",$p).") {return ".$var_name.".call_download(\"".$c.".".$m."\",[".implode(",",$p)."]);};\n";
                }

            }
        }
    }

    foreach($GLOBALS['JsonRPCSignals'] as $a){
        $jsapi .= $var_name.".slots.".$a." = [];\n";
    }

    $js.= $jsapi;

    header('Content-Type: application/javascript');
    echo $js;

} else {
    http_response_code(400);
}


?>
