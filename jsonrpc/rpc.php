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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER["CONTENT_TYPE"] == "application/json") {
    try {
        header('Content-Type: application/json; charset=utf-8');

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

        foreach($callList as $data){

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

                ob_start();

                $GLOBALS['JsonRPCSignalList'] = [];
                $result = $handler->{$method_name}(...$data['params']);
                usleep(300000);

                foreach($JsonRPCSignalList as $sig){
                    $respList[]=["jsonrpc" => "2.0", "method" => $sig[0], "params" => $sig[1]];
                }

                $GLOBALS['JsonRPCSignalList'] = [];

                if (isset($data["id"])){
                    $respList[]=["jsonrpc" => "2.0", "result" => $result, "id" => $data["id"]];
                }

            } catch (JsonRPCException $exception) {
                if (isset($data["id"])){
                    $respList[]=["jsonrpc" => "2.0", "error" => ["code" => $exception->JsonRPCErrorCode(), "message" => $exception->getMessage()], "id" => $data["id"]];
                } else {
                    $respList[]=["jsonrpc" => "2.0", "error" => ["code" => $exception->JsonRPCErrorCode(), "message" => $exception->getMessage()], "id" => NULL];
                }
            } catch (Throwable $exception) {
                if (isset($data["id"])){
                    $respList[]=["jsonrpc" => "2.0", "error" => ["code" => -32603, "message" => $exception->getMessage()], "id" => $data["id"]];
                }
            } finally {
                ob_end_clean();
            }

        }

    if (count($respList) == 1){
        echo json_encode($respList[0]);
    } else {
        echo json_encode($respList);
    }


    } catch (\JsonException $exception) {
        echo json_encode(["jsonrpc" => "2.0", "error" => ["code" => -32700, "message" => $exception->getMessage()], "id" => null]);
    } catch (JsonRPCException $exception) {
        echo json_encode(["jsonrpc" => "2.0", "error" => ["code" => $exception->JsonRPCErrorCode(), "message" => $exception->getMessage()], "id" => null]);
    } catch (Throwable $e) {
        echo json_encode(["jsonrpc" => "2.0", "error" => ["code" => -32099, "message" => $exception->getMessage()], "id" => null]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET["format"] == "js") {

    $var_name= "jrpc";
    $var_url= "rpc.php";

    $api = JsonRPCAPIDiscover();

    if(isset($_GET["var"]))
        $var_name = preg_replace("/[^a-zA-Z0-9_]+/", "", $_GET["var"]);

    $js = file_get_contents('jsonrpc.js');

    $js = str_replace("_jrpc",$var_name, $js);
    $js = str_replace("_rpcurl",'"'.$var_url.'"', $js);

    foreach($api as $c => $m){
        if ($c == ""){
            foreach($api[$c] as $m => $p){
                $js .= $var_name.".".$m." = function (".implode(",",$p).") {return ".$var_name.".call(\"".$m."\",[".implode(",",$p)."]);};\n";
            }
        } else {
            $js .= "jrpc.".$c." = {};\n";
            foreach($api[$c] as $m => $p){
                $js .= $var_name.".".$c.".".$m." = function (".implode(",",$p).") {return ".$var_name.".call(\"".$c.".".$m."\",[".implode(",",$p)."]);};\n";
            }
        }
    }

    foreach($GLOBALS['JsonRPCSignals'] as $a){
        $js .= $var_name.".slots.".$a." = [];\n";
    }

    header('Content-Type: application/javascript');
    echo $js;

} else {
    http_response_code(400);
}


?>
