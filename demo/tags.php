<?php

header('Content-Type: application/json;charset=utf-8');
echo json_encode(['Result' => 'OK', 'Options' => [['tag1','Tag 1'],['tag2','Tag 2'],['tag3','Tag 3']]], JSON_UNESCAPED_UNICODE);
