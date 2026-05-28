<?php

require "jsonc.php";

$orig = json_decode(file_get_contents("sample.json"), JSON_OBJECT_AS_ARRAY);

try {
    $alter = jsonc_decode(file_get_contents("sample.jsonc"));
} catch (JsonException $ex) {
    echo $ex->getMessage(); // Outputs: "Syntax error near location 1:3"
}

if($orig == $alter){
    echo "Test passed";
} else {
    echo "Test error";
    exit(1);
}
