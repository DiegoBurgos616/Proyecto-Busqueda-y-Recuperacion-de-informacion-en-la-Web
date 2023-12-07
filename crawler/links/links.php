
<?php 
$file = file_get_contents("../links.txt");
$file = explode("\n", $file);
// $d = array();
// for($i=0;$i<count($file); $i++){
//     $d[]= array('id' => $i, 'link' => $file[$i]);
// }
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
$json = json_encode($file);
echo($json);
// echo (json_encode($file, JSON_FORCE_OBJECT));
?>
