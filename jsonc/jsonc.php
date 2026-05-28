<?php

function jsonc_decode($data, $assoc = true, $maxDepth = 512, $opts = JSON_THROW_ON_ERROR | JSON_OBJECT_AS_ARRAY) {
    $data = preg_replace_callback('/\/\*[\s\S]*?\*\//',
                                  function ($matches) {
                                      $newlines = substr_count($matches[0], "\n");
                                      return str_repeat("\n", $newlines);
                                  }, $data); # /* comment
                                  $data = preg_replace('/\/\/.*$/m', " ", $data); # // comment
                                  $data = preg_replace('/,(\s*)(?=[\]}])/', '$1', $data); # tailing ,

    return json_decode($data, $assoc, $maxDepth, $opts);
}
